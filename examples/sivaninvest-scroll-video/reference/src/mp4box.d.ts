/**
 * Minimal ambient typings for mp4box@0.5.2 (the package ships no types).
 * Only the surface used by useVideoScrub is declared.
 */
declare module 'mp4box' {
  export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

  export interface MP4VideoTrack {
    id: number;
    codec: string;
    duration: number;
    timescale: number;
    nb_samples: number;
    video: { width: number; height: number };
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    isFragmented: boolean;
    videoTracks: MP4VideoTrack[];
  }

  export interface MP4Sample {
    number: number;
    track_id: number;
    timescale: number;
    cts: number;
    dts: number;
    duration: number;
    is_sync: boolean;
    size: number;
    data: Uint8Array;
  }

  /** Any parsed ISO-BMFF box that can serialise itself (header + payload). */
  export interface MP4WritableBox {
    type: string;
    write(stream: DataStream): void;
  }

  export interface MP4SampleEntry {
    type: string;
    avcC?: MP4WritableBox;
    hvcC?: MP4WritableBox;
    vpcC?: MP4WritableBox;
    av1C?: MP4WritableBox;
  }

  export interface MP4Trak {
    mdia: { minf: { stbl: { stsd: { entries: MP4SampleEntry[] } } } };
  }

  export interface MP4ExtractionOptions {
    nbSamples?: number;
    rapAlignement?: boolean;
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void;
    onError?: (error: string) => void;
    onSamples?: (id: number, user: unknown, samples: MP4Sample[]) => void;
    appendBuffer(data: MP4ArrayBuffer): number;
    start(): void;
    stop(): void;
    flush(): void;
    setExtractionOptions(id: number, user?: unknown, options?: MP4ExtractionOptions): void;
    getTrackById(id: number): MP4Trak;
  }

  export class DataStream {
    constructor(arrayBuffer?: ArrayBuffer | DataView, byteOffset?: number, endianness?: boolean);
    static readonly BIG_ENDIAN: boolean;
    static readonly LITTLE_ENDIAN: boolean;
    buffer: ArrayBuffer;
  }

  export function createFile(keepMdatData?: boolean): MP4File;

  const MP4Box: {
    createFile: typeof createFile;
    DataStream: typeof DataStream;
  };
  export default MP4Box;
}
