import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowDown, ArrowRight, ChevronUp, Info, X } from 'lucide-react';
import { useVideoScrub } from '@/useVideoScrub';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4';

const DARK = '#1D3045';

const NAV_LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+'];
const ACTIVE_LINK = 'VECTRUS ENERGY';

const EASE_OUT_EXPO = 'cubic-bezier(0.16,1,0.3,1)';
const EASE_STANDARD = 'cubic-bezier(0.4,0,0.2,1)';

/* ------------------------------------------------------------------ */
/* Section opacity curves                                              */
/* ------------------------------------------------------------------ */

function s1Opacity(p: number): number {
  if (p < 0.2) return 1;
  return Math.max(0, 1 - (p - 0.2) / 0.08);
}

function s2Opacity(p: number): number {
  if (p < 0.32) return 0;
  if (p < 0.4) return (p - 0.32) / 0.08;
  if (p < 0.55) return 1;
  return Math.max(0, 1 - (p - 0.55) / 0.08);
}

function s3Opacity(p: number): number {
  if (p < 0.67) return 0;
  if (p < 0.75) return (p - 0.67) / 0.08;
  return 1;
}

/* ------------------------------------------------------------------ */
/* Stagger                                                             */
/* ------------------------------------------------------------------ */

interface StaggerProps {
  visible: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}

function Stagger({ visible, delay = 0, className, children }: StaggerProps) {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s ${EASE_OUT_EXPO} ${delay}ms, transform 0.8s ${EASE_OUT_EXPO} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function navEntrance(mounted: boolean, delay: number): CSSProperties {
  return {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(-12px)',
    transition: `opacity 0.6s ${EASE_OUT_EXPO} ${delay}ms, transform 0.6s ${EASE_OUT_EXPO} ${delay}ms`,
  };
}

interface NavbarProps {
  isLight: boolean;
  onOpenMenu: () => void;
}

function Navbar({ isLight, onOpenMenu }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const navColor = isLight ? '#fff' : DARK;

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 pointer-events-auto px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 flex items-center justify-between transition-colors duration-500"
      style={{ color: navColor }}
    >
      {/* Desktop links (lg+) */}
      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {NAV_LINKS.map((label, i) => (
          <div key={label} className="flex" style={navEntrance(mounted, i * 80 + 100)}>
            <a href="#" className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70">
              {label}
              {label === ACTIVE_LINK && <span className="absolute left-0 -bottom-3 w-full h-[2px] bg-current" />}
            </a>
          </div>
        ))}
      </div>

      {/* Hamburger (< lg) */}
      <button type="button" aria-label="Open menu" onClick={onOpenMenu} className="lg:hidden flex flex-col gap-[5px]">
        <span className="block w-6 h-[2px] bg-current" />
        <span className="block w-6 h-[2px] bg-current" />
        <span className="block w-4 h-[2px] bg-current" />
      </button>

      {/* Right cluster (sm+) */}
      <div className="hidden sm:flex items-center gap-8" style={navEntrance(mounted, 500)}>
        <a href="#" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium">
          NEWS
          <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center">
            <Info size={10} color={isLight ? DARK : '#fff'} className="transition-colors duration-500" />
          </span>
        </a>
        <span className="hidden lg:inline text-xs tracking-[0.2em] uppercase font-medium">MENU</span>
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden text-xs tracking-[0.2em] uppercase font-medium"
        >
          MENU
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile menu overlay                                                 */
/* ------------------------------------------------------------------ */

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-500 ease-in-out ${
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{ backgroundColor: DARK }}
    >
      <div
        className={`h-full flex flex-col transition-transform duration-500 ease-in-out ${
          open ? 'translate-y-0' : '-translate-y-8'
        }`}
      >
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href="#"
              className={`py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase ${
                label === ACTIVE_LINK ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ${EASE_STANDARD} ${i * 60}ms, transform 0.5s ${EASE_STANDARD} ${i * 60}ms`,
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="px-8 sm:px-12 pb-10 flex items-center gap-8 text-xs tracking-[0.2em] uppercase text-white/60">
          <a href="#">NEWS</a>
          <a href="#">CONTACT</a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

interface SectionProps {
  opacity: number;
}

const sectionStyle = (opacity: number): CSSProperties => ({ opacity, transition: 'opacity 0.1s ease-out' });

function Section1({ opacity }: SectionProps) {
  const visible = opacity > 0.3;
  return (
    <section
      className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-20 lg:px-32"
      style={sectionStyle(opacity)}
    >
      <Stagger visible={visible} delay={0}>
        <h1
          className="font-light uppercase leading-[1.2]"
          style={{ fontSize: 'clamp(2rem,5vw,5rem)', color: DARK }}
        >
          Advancing resources for a cleaner future
        </h1>
      </Stagger>
      <Stagger visible={visible} delay={150}>
        <p className="mt-6 text-sm tracking-[0.3em] uppercase" style={{ color: `${DARK}90` }}>
          Sustainable power with purpose
        </p>
      </Stagger>
      <Stagger visible={visible} delay={300} className="absolute bottom-12 right-6 sm:right-8 md:right-12">
        <button
          type="button"
          aria-label="Next"
          className={`w-12 h-12 rounded-full border flex items-center justify-center hover:opacity-70 ${
            visible ? 'pointer-events-auto' : ''
          }`}
          style={{ borderColor: `${DARK}50`, color: DARK }}
        >
          <ArrowRight size={18} />
        </button>
      </Stagger>
    </section>
  );
}

function Section2({ opacity }: SectionProps) {
  const visible = opacity > 0.3;
  return (
    <section
      className="absolute inset-0 flex items-center justify-center px-6 sm:px-8"
      style={sectionStyle(opacity)}
    >
      <div className="max-w-[900px]">
        <Stagger visible={visible} delay={0}>
          <h2
            className="font-extralight tracking-wide leading-[1.3] text-center uppercase"
            style={{ fontSize: 'clamp(1.5rem,4.5vw,4.5rem)', color: DARK }}
          >
            We build lasting partnerships with vision <span style={{ color: `${DARK}80` }}>and precision</span>{' '}
            <span style={{ color: `${DARK}50` }}>across every frontier</span>
          </h2>
        </Stagger>
      </div>

      <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
        <Stagger visible={visible} delay={200}>
          <button
            type="button"
            aria-label="Scroll down"
            className={`w-12 h-12 rounded-full border flex items-center justify-center ${
              visible ? 'pointer-events-auto' : ''
            }`}
            style={{ borderColor: `${DARK}40`, color: DARK }}
          >
            <ArrowDown size={18} />
          </button>
        </Stagger>
        <Stagger visible={visible} delay={350}>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: DARK }} />
            <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${DARK}40` }} />
            <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${DARK}40` }} />
          </div>
        </Stagger>
        <Stagger visible={visible} delay={500}>
          <button
            type="button"
            aria-label="Scroll up"
            className={`mt-2 w-10 h-10 rounded-full border flex items-center justify-center ${
              visible ? 'pointer-events-auto' : ''
            }`}
            style={{ borderColor: `${DARK}30`, color: `${DARK}80` }}
          >
            <ChevronUp size={16} />
          </button>
        </Stagger>
      </div>
    </section>
  );
}

function Section3({ opacity }: SectionProps) {
  const visible = opacity > 0.3;
  return (
    <section
      className="absolute inset-0 flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32"
      style={sectionStyle(opacity)}
    >
      <div className="max-w-2xl text-left">
        <Stagger visible={visible} delay={0}>
          <p className="text-white/60 text-lg tracking-wide mb-4">Halder | Nordvik</p>
        </Stagger>
        <Stagger visible={visible} delay={150}>
          <h2
            className="font-light text-white leading-[1.2] uppercase tracking-wide mb-8"
            style={{ fontSize: 'clamp(2rem,4vw,4rem)' }}
          >
            Fueling ambition,
            <br />
            shaping tomorrow.
          </h2>
        </Stagger>
        <Stagger visible={visible} delay={300}>
          <div className="flex items-center gap-4">
            <span className="text-sm tracking-[0.3em] text-white/80 uppercase">Contact Nordvik</span>
            <button
              type="button"
              aria-label="Contact Nordvik"
              className={`w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform duration-300 ${
                visible ? 'pointer-events-auto' : ''
              }`}
            >
              <ArrowRight size={16} className="text-gray-800" />
            </button>
          </div>
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const { videoRef, canvasRef, containerRef, scrollProgress, canvasLive } = useVideoScrub(VIDEO_SRC);
  const [menuOpen, setMenuOpen] = useState(false);

  const p = scrollProgress;
  const isLight = p > 0.55;

  return (
    <>
      <div ref={containerRef} className="relative h-[500vh]">
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              canvasLive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 pointer-events-none">
            <Navbar isLight={isLight} onOpenMenu={() => setMenuOpen(true)} />
            <Section1 opacity={s1Opacity(p)} />
            <Section2 opacity={s2Opacity(p)} />
            <Section3 opacity={s3Opacity(p)} />
          </div>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
