import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import MP4Box from 'mp4box';
import type { MP4ArrayBuffer, MP4File, MP4Sample } from 'mp4box';

/* ------------------------------------------------------------------ */
/* Constants (spec: SMOOTH VIDEO SCROLL)                               */
/* ------------------------------------------------------------------ */
const LERP_TAU = 8;
const SNAP = 0.002;
const LRU_MAX = 24;
const LEAD = 24;
const WATCHDOG = 60000;
const WEBP_QUALITY = 0.82;

/** One decoded frame: presentation timestamp (microseconds) + webp blob. */
interface BankFrame {
  ts: number;
  blob: Blob;
}

interface Demuxed {
  config: VideoDecoderConfig;
  chunks: EncodedVideoChunk[];
  /** Movie duration in seconds from the mp4 header. */
  duration: number;
}

type EncodeCanvas = OffscreenCanvas | HTMLCanvasElement;

export interface VideoScrub {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<HTMLDivElement>;
  scrollProgress: number;
  canvasLive: boolean;
}

/* ------------------------------------------------------------------ */
/* mp4box demux                                                        */
/* ------------------------------------------------------------------ */

/**
 * Serialises the codec configuration box (avcC / hvcC / vpcC / av1C) of the
 * track's sample entry and strips its 8-byte box header (size + fourcc),
 * leaving the raw decoder configuration record WebCodecs expects.
 */
function getDescription(file: MP4File, trackId: number): Uint8Array | undefined {
  const trak = file.getTrackById(trackId);
  for (const entry of trak.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (box) {
      const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }
  return undefined;
}

/** Parses the whole mp4 in memory and turns every video sample into a chunk. */
function demux(buffer: ArrayBuffer): Demuxed {
  const file = MP4Box.createFile();
  const chunks: EncodedVideoChunk[] = [];
  let config: VideoDecoderConfig | null = null;
  let duration = 0;
  let parseError: string | null = null;

  file.onError = (error: string) => {
    parseError = error;
  };
  file.onReady = (info) => {
    const track = info.videoTracks[0];
    if (!track) return;
    duration = info.timescale > 0 ? info.duration / info.timescale : 0;
    config = {
      codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
      codedWidth: track.video.width,
      codedHeight: track.video.height,
      description: getDescription(file, track.id),
    };
    file.setExtractionOptions(track.id);
    file.start();
  };
  file.onSamples = (_id: number, _user: unknown, samples: MP4Sample[]) => {
    for (const sample of samples) {
      chunks.push(
        new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        }),
      );
    }
  };

  const ab = buffer as MP4ArrayBuffer;
  ab.fileStart = 0;
  file.appendBuffer(ab);
  file.flush();

  if (parseError) throw new Error(`mp4box: ${parseError}`);
  if (!config || chunks.length === 0) throw new Error('mp4box: no video samples');
  return { config, chunks, duration };
}

/* ------------------------------------------------------------------ */
/* WebCodecs decode -> webp frame bank                                 */
/* ------------------------------------------------------------------ */

function createEncodeCanvas(width: number, height: number): EncodeCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Both APIs snapshot the bitmap synchronously, so the canvas can be reused at once. */
function encodeWebp(canvas: EncodeCanvas): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY });
  }
  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/webp',
      WEBP_QUALITY,
    );
  });
}

const CANCELLED = new Error('frame bank cancelled');

async function decodeToBank(
  demuxed: Demuxed,
  hardwareAcceleration: HardwareAcceleration | undefined,
  isStopped: () => boolean,
): Promise<BankFrame[]> {
  const { config, chunks } = demuxed;
  const bank: BankFrame[] = [];
  const pending = new Set<Promise<void>>();
  const encodeCanvas = createEncodeCanvas(config.codedWidth ?? 1920, config.codedHeight ?? 1080);
  const encodeCtx = encodeCanvas.getContext('2d') as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!encodeCtx) throw new Error('2d context unavailable');

  let failure: unknown = null;
  let wake: (() => void) | null = null;
  const notify = () => {
    const resolve = wake;
    wake = null;
    resolve?.();
  };
  /* Woken by decoder dequeue / output / encode completion; short timeout as a safety net. */
  const waitForRoom = () =>
    new Promise<void>((resolve) => {
      wake = resolve;
      setTimeout(notify, 16);
    });

  const decoder = new VideoDecoder({
    output: (frame) => {
      const ts = frame.timestamp;
      if (encodeCanvas.width !== frame.displayWidth || encodeCanvas.height !== frame.displayHeight) {
        encodeCanvas.width = frame.displayWidth;
        encodeCanvas.height = frame.displayHeight;
      }
      encodeCtx.drawImage(frame, 0, 0, encodeCanvas.width, encodeCanvas.height);
      frame.close();
      const job: Promise<void> = encodeWebp(encodeCanvas)
        .then((blob) => {
          bank.push({ ts, blob });
        })
        .catch((err: unknown) => {
          failure = failure ?? err;
        })
        .finally(() => {
          pending.delete(job);
          notify();
        });
      pending.add(job);
      notify();
    },
    error: (err) => {
      failure = failure ?? err;
      notify();
    },
  });
  decoder.addEventListener('dequeue', notify);

  try {
    decoder.configure(hardwareAcceleration ? { ...config, hardwareAcceleration } : config);
    for (const chunk of chunks) {
      /* LEAD throttle: queued decodes + in-flight webp encodes never exceed LEAD. */
      while (!failure && !isStopped() && decoder.decodeQueueSize + pending.size >= LEAD) {
        await waitForRoom();
      }
      if (isStopped()) throw CANCELLED;
      if (failure || decoder.state === 'closed') throw failure ?? new Error('decoder closed');
      decoder.decode(chunk);
    }
    await decoder.flush();
    await Promise.all(Array.from(pending));
    if (isStopped()) throw CANCELLED;
    if (failure) throw failure;
    if (bank.length === 0) throw new Error('decoder produced no frames');
  } finally {
    decoder.removeEventListener('dequeue', notify);
    if (decoder.state !== 'closed') decoder.close();
  }

  bank.sort((a, b) => a.ts - b.ts);
  return bank;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useVideoScrub(videoSrc: string): VideoScrub {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController();

    let bank: BankFrame[] = [];
    const lru = new Map<number, ImageBitmap | null>();
    let current = 0;
    let target = 0;
    let ready = false;
    let reverted = false;
    let painted = false;
    let building = false;
    let dur = 0;
    let disposed = false;
    let lastDrawn = -1;
    let span = 0;
    let rafId = 0;
    let watchdogId = 0;
    let last = performance.now();

    const isStopped = () => disposed || reverted;

    /* ---- scroll span / progress ---- */
    const measure = () => {
      span = container.offsetHeight - window.innerHeight;
    };
    const getProgress = () => (span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0);

    /* ---- duration ---- */
    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) dur = video.duration;
    };

    /* ---- LRU of decoded ImageBitmaps ---- */
    const releaseLru = () => {
      lru.forEach((bmp) => bmp?.close());
      lru.clear();
    };

    const warmLRU = (i: number) => {
      for (let j = i - 1; j <= i + 2; j++) {
        if (j < 0 || j >= bank.length) continue;
        if (lru.has(j)) {
          const value = lru.get(j) ?? null;
          lru.delete(j);
          lru.set(j, value); // refresh recency
          continue;
        }
        lru.set(j, null); // pending
        createImageBitmap(bank[j].blob).then(
          (bmp) => {
            if (isStopped() || !ready || lru.get(j) !== null) {
              bmp.close(); // evicted, already filled, or torn down
              return;
            }
            lru.set(j, bmp);
          },
          () => {
            if (lru.get(j) === null) lru.delete(j);
          },
        );
      }
      while (lru.size > LRU_MAX) {
        const oldest = lru.keys().next().value as number;
        lru.get(oldest)?.close();
        lru.delete(oldest);
      }
    };

    /* ---- binary search on timestamps ---- */
    const nearestIndex = (t: number) => {
      const us = t * 1e6;
      let lo = 0;
      let hi = bank.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (bank[mid].ts < us) lo = mid + 1;
        else hi = mid;
      }
      if (lo > 0 && Math.abs(bank[lo - 1].ts - us) <= Math.abs(bank[lo].ts - us)) return lo - 1;
      return lo;
    };

    const drawFrame = () => {
      if (!ctx || bank.length === 0) return;
      const i = nearestIndex(current);
      warmLRU(i);
      if (i === lastDrawn) return;
      const bmp = lru.get(i);
      if (!bmp) return;
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      lastDrawn = i;
      if (!painted) {
        painted = true;
        setCanvasLive(true);
      }
    };

    /* ---- revert to plain <video> seeking ---- */
    const revert = () => {
      if (reverted) return;
      reverted = true;
      ready = false;
      building = false;
      abort.abort();
      window.clearTimeout(watchdogId);
      releaseLru();
      bank = [];
      lastDrawn = -1;
      setCanvasLive(false);
    };

    /* ---- frame bank build ---- */
    const buildBank = async () => {
      if (building || ready || reverted) return;
      if (reducedMotion.matches || typeof VideoDecoder === 'undefined') return;
      building = true;
      watchdogId = window.setTimeout(() => {
        if (!painted) revert();
      }, WATCHDOG);

      try {
        const res = await fetch(videoSrc, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        if (isStopped()) return;

        const demuxed = demux(buffer);
        if (!(dur > 0) && demuxed.duration > 0) dur = demuxed.duration;

        let frames: BankFrame[];
        try {
          frames = await decodeToBank(demuxed, undefined, isStopped);
        } catch (err) {
          if (isStopped() || err === CANCELLED) return;
          /* Hardware decode failed: retry once in software. */
          frames = await decodeToBank(demuxed, 'prefer-software', isStopped);
        }
        if (isStopped()) return;

        bank = frames;
        ready = true;
        building = false;
      } catch {
        if (!disposed) revert();
      }
    };

    const onWindowLoad = () => {
      void buildBank();
    };

    /* ---- rAF loop ---- */
    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;

      const p = getProgress();
      setScrollProgress(p);

      if (dur > 0) {
        target = p * dur;
        if (reducedMotion.matches) {
          current = target;
        } else {
          current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
          if (Math.abs(target - current) < SNAP) current = target;
        }

        if (ready) {
          drawFrame();
        } else if (!video.seeking && Math.abs(video.currentTime - current) > 0.01) {
          video.currentTime = current;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    /* ---- wire up ---- */
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    if (video.readyState >= 1) onLoadedMetadata();

    if (document.readyState === 'complete') onWindowLoad();
    else window.addEventListener('load', onWindowLoad);

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(rafId);
      window.clearTimeout(watchdogId);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.removeEventListener('load', onWindowLoad);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      releaseLru();
      bank = [];
    };
  }, [videoSrc]);

  return { videoRef, canvasRef, containerRef, scrollProgress, canvasLive };
}
