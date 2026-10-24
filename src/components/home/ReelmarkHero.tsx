import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReelmarkHeroProps {
  badgeText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subline?: string[];
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  note1Text?: string;
  note2Text?: string;
}

export const ReelmarkHero: React.FC<ReelmarkHeroProps> = ({
  badgeText = 'Trusted by 120,000+ indie makers',
  headlineLine1 = 'Captivate Crowds',
  headlineLine2 = 'with Snackable Reels',
  subline = [
    'Grow your brand with short, snappy product clips by',
    'our handpicked video makers. Our crew is ready to',
    'lift your next launch higher.',
  ],
  ctaText = 'Make a Reel',
  ctaLink = '/seller/register',
  onCtaClick,
  note1Text = 'Be seen\nwith clips',
  note2Text = 'Zero cost',
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // References for entrance animations
  const badgeRef = useRef<HTMLDivElement>(null);
  const h1Line1Ref = useRef<HTMLSpanElement>(null);
  const h1Line2Ref = useRef<HTMLSpanElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const note1Ref = useRef<HTMLDivElement>(null);
  const note2Ref = useRef<HTMLDivElement>(null);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
    } else if (ctaLink) {
      if (ctaLink.startsWith('/')) {
        e.preventDefault();
        navigate(ctaLink);
      }
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const container = containerRef.current;
    if (!viewport || !container) return;

    const POSTER_URL =
      'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b7ebb74a-8c8a-4f7e-8f80-55e2d74ecd05.webp';
    const VIDEO_URL =
      'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/04fd3d5f-99d7-476e-98a4-46c08518ffb3.mp4';

    const NUM_CARDS = 10;
    const PITCH = 196; // 196u pitch
    const TOTAL_SPAN = NUM_CARDS * PITCH; // 1960u loop span
    const HALF_SPAN = TOTAL_SPAN / 2; // 980u
    const CENTER_X = 720;
    const NORM_DIST = 706;
    const AUTO_SPEED = 50; // 50u per second right -> left

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Clear previous children if any
    viewport.innerHTML = '';

    interface CardItem {
      index: number;
      col: number;
      row: number;
      cardEl: HTMLDivElement;
      atlasEl: HTMLDivElement;
      badgeEl: HTMLDivElement;
      videoEl: HTMLVideoElement | null;
    }

    const cards: CardItem[] = [];
    const videos: HTMLVideoElement[] = [];

    // Create 10 cards mapped to the 5x2 video/poster grid
    for (let i = 0; i < NUM_CARDS; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);

      const cardEl = document.createElement('div');
      cardEl.className = 'reel-card';

      const atlasEl = document.createElement('div');
      atlasEl.className = 'card-atlas';

      const posterEl = document.createElement('div');
      posterEl.className = 'card-poster';
      posterEl.style.backgroundImage = `url('${POSTER_URL}')`;

      atlasEl.appendChild(posterEl);

      let videoEl: HTMLVideoElement | null = null;
      if (!prefersReducedMotion) {
        videoEl = document.createElement('video');
        videoEl.className = 'card-video';
        videoEl.src = VIDEO_URL;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.setAttribute('muted', '');
        videoEl.setAttribute('playsinline', '');
        videoEl.preload = 'auto';

        videoEl.addEventListener(
          'loadeddata',
          () => {
            if (videoEl) videoEl.classList.add('is-ready');
          },
          { once: true }
        );

        atlasEl.appendChild(videoEl);
        videos.push(videoEl);
      }

      const badgeEl = document.createElement('div');
      badgeEl.className = 'card-play-badge';
      badgeEl.innerHTML = `<svg viewBox="0 0 12 14"><path d="M1.8 1.1C1.1 0.7 0.2 1.2 0.2 2.0V12.0C0.2 12.8 1.1 13.3 1.8 12.9L10.8 7.9C11.5 7.5 11.5 6.5 10.8 6.1L1.8 1.1Z"/></svg>`;

      cardEl.appendChild(atlasEl);
      cardEl.appendChild(badgeEl);
      viewport.appendChild(cardEl);

      cards.push({
        index: i,
        col,
        row,
        cardEl,
        atlasEl,
        badgeEl,
        videoEl,
      });
    }

    // Keep all 10 videos playing in tight sync
    let syncInterval: number | null = null;
    if (!prefersReducedMotion && videos.length > 0) {
      const masterVideo = videos[0];
      videos.forEach((v) => {
        v.play().catch(() => {});
      });

      syncInterval = window.setInterval(() => {
        if (masterVideo.readyState >= 2 && !masterVideo.paused) {
          const masterTime = masterVideo.currentTime;
          for (let i = 1; i < videos.length; i++) {
            const v = videos[i];
            if (v.readyState >= 2) {
              if (v.paused) v.play().catch(() => {});
              const drift = Math.abs(v.currentTime - masterTime);
              if (drift > 0.08 && drift < 4.5) {
                v.currentTime = masterTime;
              }
            }
          }
        }
      }, 250);
    }

    function buildRoundedQuadPath(
      W: number,
      yTL: number,
      yTR: number,
      yBR: number,
      yBL: number,
      r: number
    ) {
      const dx = W;
      const dyTop = yTR - yTL;
      const lenTop = Math.hypot(dx, dyTop) || 1;
      const uxTop = dx / lenTop;
      const uyTop = dyTop / lenTop;

      const dyBot = yBR - yBL;
      const lenBot = Math.hypot(dx, dyBot) || 1;
      const uxBot = dx / lenBot;
      const uyBot = dyBot / lenBot;

      // Clamp corner radius if edges are very short
      const cr = Math.min(r, W * 0.25, (yBL - yTL) * 0.25, (yBR - yTR) * 0.25);

      const tlStartX = 0;
      const tlStartY = yTL + cr;
      const tlEndX = cr * uxTop;
      const tlEndY = yTL + cr * uyTop;

      const trStartX = W - cr * uxTop;
      const trStartY = yTR - cr * uyTop;
      const trEndX = W;
      const trEndY = yTR + cr;

      const brStartX = W;
      const brStartY = yBR - cr;
      const brEndX = W - cr * uxBot;
      const brEndY = yBR - cr * uyBot;

      const blStartX = cr * uxBot;
      const blStartY = yBL + cr * uyBot;
      const blEndX = 0;
      const blEndY = yBL - cr;

      return (
        `M ${tlStartX.toFixed(2)} ${tlStartY.toFixed(2)} ` +
        `Q 0 ${yTL.toFixed(2)} ${tlEndX.toFixed(2)} ${tlEndY.toFixed(2)} ` +
        `L ${trStartX.toFixed(2)} ${trStartY.toFixed(2)} ` +
        `Q ${W.toFixed(2)} ${yTR.toFixed(2)} ${trEndX.toFixed(2)} ${trEndY.toFixed(2)} ` +
        `L ${brStartX.toFixed(2)} ${brStartY.toFixed(2)} ` +
        `Q ${W.toFixed(2)} ${yBR.toFixed(2)} ${brEndX.toFixed(2)} ${brEndY.toFixed(2)} ` +
        `L ${blStartX.toFixed(2)} ${blStartY.toFixed(2)} ` +
        `Q 0 ${yBL.toFixed(2)} ${blEndX.toFixed(2)} ${blEndY.toFixed(2)} Z`
      );
    }

    function getUnitScale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw <= 820) {
        return {
          u: vw / 640,
          isMobile: true,
          viewportCenterPx: vw / 2,
          centerYUnits: 250 / 2 / (vw / 640),
        };
      }
      const u = Math.min(vw / 1440, vh / 1080);
      return {
        u,
        isMobile: false,
        viewportCenterPx: (1440 * u) / 2,
        centerYUnits: 687,
      };
    }

    let scrollOffset = 0;
    let velocity = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastMoveTime = 0;
    let pointerVelocityTracker = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
      lastPointerX = e.clientX;
      lastMoveTime = performance.now();
      pointerVelocityTracker = 0;
      velocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime) / 1000;
      const dxPx = e.clientX - lastPointerX;
      const { u } = getUnitScale();
      const dxUnits = dxPx / u;

      scrollOffset += dxUnits;
      const instantVel = dxUnits / dt;
      pointerVelocityTracker = pointerVelocityTracker * 0.35 + instantVel * 0.65;

      lastPointerX = e.clientX;
      lastMoveTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
      if (performance.now() - lastMoveTime < 120) {
        velocity = pointerVelocityTracker;
      }
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);

    function updateCarouselGeometry() {
      const { u, isMobile, viewportCenterPx, centerYUnits } = getUnitScale();

      for (let i = 0; i < NUM_CARDS; i++) {
        const card = cards[i];

        let rawT = (i * PITCH + scrollOffset) % TOTAL_SPAN;
        if (rawT < 0) rawT += TOTAL_SPAN;
        const t = rawT - HALF_SPAN; // in [-980, 980)

        // Cull cards well outside visible stage
        if (Math.abs(t) > 890) {
          card.cardEl.style.display = 'none';
          continue;
        }
        card.cardEl.style.display = 'block';

        const tNorm = t / NORM_DIST;
        const pushedOffset = t * (1 + 0.083 * tNorm * tNorm);
        const x = CENTER_X + pushedOffset;

        const d = Math.abs(x - CENTER_X) / NORM_DIST;
        const wUnits = 170 + 48 * (d * d);

        const xL = x - wUnits / 2;
        const xR = x + wUnits / 2;

        const qL = Math.abs(xL - CENTER_X) / NORM_DIST;
        const qR = Math.abs(xR - CENTER_X) / NORM_DIST;

        const hLUnits = 280 + 92 * Math.pow(qL, 2.6);
        const hRUnits = 280 + 92 * Math.pow(qR, 2.6);

        const yCenterUnits =
          (isMobile ? centerYUnits + 8 : 687) - 12 * (d * d);

        const boxHUnits = Math.max(hLUnits, hRUnits);
        const boxTopUnits = yCenterUnits - boxHUnits / 2;

        const W = wUnits * u;
        const H = boxHUnits * u;
        const hLPx = hLUnits * u;
        const hRPx = hRUnits * u;

        const leftPx = viewportCenterPx + pushedOffset * u - W / 2;
        const topPx = boxTopUnits * u;

        const yTL = (H - hLPx) / 2;
        const yBL = (H + hLPx) / 2;
        const yTR = (H - hRPx) / 2;
        const yBR = (H + hRPx) / 2;

        const cornerRadiusPx = 15 * u;
        const pathStr = buildRoundedQuadPath(
          W,
          yTL,
          yTR,
          yBR,
          yBL,
          cornerRadiusPx
        );

        card.cardEl.style.width = `${W.toFixed(2)}px`;
        card.cardEl.style.height = `${H.toFixed(2)}px`;
        card.cardEl.style.transform = `translate3d(${leftPx.toFixed(2)}px, ${topPx.toFixed(2)}px, 0)`;
        card.cardEl.style.clipPath = `path('${pathStr}')`;
        card.cardEl.style.setProperty('-webkit-clip-path', `path('${pathStr}')`);

        const tileH = Math.max(H, W / 0.711111);
        const tileW = tileH * 0.711111;

        const atlasW = 5 * tileW;
        const atlasH = 2 * tileH;

        const centerCropX = (W - tileW) * 0.5;
        const centerCropY = (H - tileH) * 0.5;
        const offsetX = -card.col * tileW + centerCropX;
        const offsetY = -card.row * tileH + centerCropY;

        card.atlasEl.style.width = `${atlasW.toFixed(2)}px`;
        card.atlasEl.style.height = `${atlasH.toFixed(2)}px`;
        card.atlasEl.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;

        const badgeOffsetBottom = H - yBL + (isMobile ? 9 : 14 * u);
        card.badgeEl.style.bottom = `${badgeOffsetBottom.toFixed(2)}px`;
      }
    }

    let animationFrameId: number;
    let prevClockTime = performance.now();

    function tick() {
      const nowClock = performance.now();
      const dt = Math.min(0.1, Math.max(0, (nowClock - prevClockTime) / 1000));
      prevClockTime = nowClock;

      if (!isDragging) {
        const autoDelta = prefersReducedMotion ? 0 : -AUTO_SPEED * dt;
        scrollOffset += autoDelta + velocity * dt;

        velocity *= Math.pow(0.05, dt);
        if (Math.abs(velocity) < 0.2) velocity = 0;
      }

      updateCarouselGeometry();
      animationFrameId = requestAnimationFrame(tick);
    }

    updateCarouselGeometry();
    animationFrameId = requestAnimationFrame(tick);

    // Run entrance animations
    if (!prefersReducedMotion) {
      const easeOutQuint = 'cubic-bezier(0.22, 1, 0.36, 1)';
      const easeOutBack = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

      if (badgeRef.current) {
        badgeRef.current.animate(
          [
            { opacity: 0, transform: 'scale(0.82) translateY(8px)' },
            { opacity: 1, transform: 'scale(1) translateY(0)' },
          ],
          {
            duration: 560,
            delay: 140,
            easing: easeOutBack,
            fill: 'both',
          }
        );
      }

      [h1Line1Ref.current, h1Line2Ref.current].forEach((line, idx) => {
        if (!line) return;
        line.animate(
          [
            { opacity: 0, transform: 'translateY(28px)', filter: 'blur(12px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          ],
          {
            duration: 780,
            delay: 220 + idx * 110,
            easing: easeOutQuint,
            fill: 'both',
          }
        );
      });

      if (sublineRef.current) {
        sublineRef.current.animate(
          [
            { opacity: 0, transform: 'translateY(18px)', filter: 'blur(6px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          ],
          {
            duration: 680,
            delay: 420,
            easing: easeOutQuint,
            fill: 'both',
          }
        );
      }

      viewport.animate(
        [
          { opacity: 0, transform: 'translateY(48px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 860,
          delay: 480,
          easing: easeOutQuint,
          fill: 'both',
        }
      );

      if (ctaRef.current) {
        ctaRef.current.animate(
          [
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          {
            duration: 620,
            delay: 640,
            easing: easeOutBack,
            fill: 'both',
          }
        );
      }

      [note1Ref.current, note2Ref.current].forEach((note, idx) => {
        if (!note) return;
        const rot = idx === 0 ? 'rotate(16deg)' : 'rotate(24deg)';
        note.animate(
          [
            { opacity: 0, transform: `${rot} translateY(8px)` },
            { opacity: 1, transform: `${rot} translateY(0)` },
          ],
          {
            duration: 540,
            delay: 680 + idx * 90,
            easing: easeOutQuint,
            fill: 'both',
          }
        );
      });

      const strokeElements = container.querySelectorAll<SVGPathElement>('.draw-stroke');
      strokeElements.forEach((path, idx) => {
        const len = path.getTotalLength ? path.getTotalLength() : 220;
        path.style.strokeDasharray = `${len}`;
        path.animate(
          [
            { strokeDashoffset: len, opacity: 0 },
            { strokeDashoffset: len * 0.85, opacity: 1, offset: 0.15 },
            { strokeDashoffset: 0, opacity: 1 },
          ],
          {
            duration: 720,
            delay: 720 + idx * 75,
            easing: easeOutQuint,
            fill: 'both',
          }
        );
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (syncInterval) clearInterval(syncInterval);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
      videos.forEach((v) => {
        v.pause();
        v.src = '';
      });
    };
  }, []);

  return (
    <section className="reelmark-hero-root relative w-full overflow-hidden select-none bg-[#F5F8EF] border-b border-[#E5E7EB]">
      {/* Scoped CSS Styles strictly faithful to reelmark_hero.html */}
      <style>{`
        .reelmark-hero-root {
          --u: min(calc(100vw / 1440), calc(100vh / 1080));
          --bg: #F5F8EF;
          --green: #08482D;
          --green-hover: #0B5E3B;
          --mint: #DAE7C7;
          --ink: #101410;
          --sub: #5E5E61;
          color: var(--ink);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .reelmark-stage {
          position: relative;
          width: 100%;
          max-width: calc(1440 * var(--u));
          height: calc(1030 * var(--u));
          margin: 0 auto;
          overflow: hidden;
        }

        .reelmark-badge {
          position: absolute;
          left: 50%;
          top: calc(75 * var(--u));
          transform: translateX(-50%);
          width: auto;
          min-width: calc(292 * var(--u));
          height: calc(37 * var(--u));
          padding: 0 calc(20 * var(--u));
          background-color: var(--mint);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: calc(16.6 * var(--u));
          color: var(--green);
          letter-spacing: -0.01em;
          z-index: 15;
          white-space: nowrap;
        }

        .reelmark-headline {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(136 * var(--u));
          text-align: center;
          font-family: 'Inter Tight', sans-serif;
          font-weight: 700;
          font-size: calc(88 * var(--u));
          line-height: calc(92 * var(--u));
          color: var(--ink);
          z-index: 15;
          pointer-events: none;
        }

        .reelmark-headline .line-1 {
          display: block;
          letter-spacing: -0.035em;
          will-change: transform, opacity, filter;
        }

        .reelmark-headline .line-2 {
          display: block;
          letter-spacing: -0.022em;
          will-change: transform, opacity, filter;
        }

        .reelmark-subline {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(354 * var(--u));
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: calc(20.8 * var(--u));
          line-height: calc(32 * var(--u));
          color: var(--sub);
          letter-spacing: -0.01em;
          z-index: 15;
          pointer-events: none;
        }

        .reelmark-subline span {
          display: block;
        }

        .doodle-slashes {
          position: absolute;
          left: calc(263 * var(--u));
          top: calc(337 * var(--u));
          width: calc(48 * var(--u));
          height: calc(46 * var(--u));
          z-index: 16;
          pointer-events: none;
          overflow: visible;
        }

        .note-beseen-group {
          position: absolute;
          left: calc(1190 * var(--u));
          top: calc(270 * var(--u));
          z-index: 16;
          pointer-events: none;
        }

        .note-beseen-text {
          font-family: 'Caveat', cursive;
          font-weight: 600;
          font-size: calc(30 * var(--u));
          line-height: 0.96;
          color: var(--green);
          transform: rotate(16deg);
          transform-origin: left top;
          white-space: pre-line;
          text-align: center;
        }

        .note-beseen-arrow {
          position: absolute;
          left: calc(-26 * var(--u));
          top: calc(64 * var(--u));
          width: calc(115 * var(--u));
          height: calc(135 * var(--u));
          overflow: visible;
        }

        .note-zerocost-group {
          position: absolute;
          left: calc(50% - 175 * var(--u));
          top: calc(885 * var(--u));
          z-index: 16;
          pointer-events: none;
        }

        .note-zerocost-text {
          font-family: 'Caveat', cursive;
          font-weight: 600;
          font-size: calc(27 * var(--u));
          line-height: 1;
          color: var(--green);
          transform: rotate(24deg);
          transform-origin: left top;
          white-space: nowrap;
        }

        .note-zerocost-arrow {
          position: absolute;
          left: calc(38 * var(--u));
          top: calc(-34 * var(--u));
          width: calc(68 * var(--u));
          height: calc(48 * var(--u));
          overflow: visible;
        }

        .draw-stroke {
          fill: none;
          stroke: var(--green);
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 400;
          stroke-dashoffset: 0;
        }

        /* Curved Video Carousel Layer */
        .carousel-viewport {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          cursor: grab;
          touch-action: pan-y;
        }

        .carousel-viewport.is-dragging {
          cursor: grabbing;
        }

        .reel-card {
          position: absolute;
          left: 0;
          top: 0;
          overflow: hidden;
          background-color: #DCE7CE;
          will-change: transform, width, height, clip-path;
          pointer-events: none;
        }

        .card-atlas {
          position: absolute;
          left: 0;
          top: 0;
          transform-origin: 0 0;
          will-change: transform, width, height;
          pointer-events: none;
        }

        .card-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }

        .card-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
          opacity: 0;
          transition: opacity 0.45s ease;
        }

        .card-video.is-ready {
          opacity: 1;
        }

        .card-play-badge {
          position: absolute;
          left: calc(14 * var(--u));
          bottom: calc(14 * var(--u));
          width: calc(32 * var(--u));
          height: calc(32 * var(--u));
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          will-change: bottom, left;
        }

        .card-play-badge svg {
          width: calc(11 * var(--u));
          height: calc(11 * var(--u));
          fill: #FFFFFF;
          margin-left: calc(1.5 * var(--u));
        }

        /* Bottom CTA Button: Centered Pill with Dashed Ring */
        .cta-ring {
          position: absolute;
          left: 50%;
          top: calc(861 * var(--u));
          transform: translateX(-50%);
          width: auto;
          min-width: calc(190 * var(--u));
          height: calc(74 * var(--u));
          padding: calc(6 * var(--u));
          border-radius: 999px;
          border: calc(1.6 * var(--u)) dashed var(--green);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          text-decoration: none;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
        }

        .cta-ring:hover {
          transform: translateX(-50%) scale(1.03);
        }

        .cta-ring:active {
          transform: translateX(-50%) scale(0.98);
        }

        .cta-pill {
          width: auto;
          min-width: calc(172 * var(--u));
          height: calc(58 * var(--u));
          padding: 0 calc(28 * var(--u));
          border-radius: 999px;
          background-color: var(--green);
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: calc(17.5 * var(--u));
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          transition: background-color 0.18s ease;
        }

        .cta-ring:hover .cta-pill {
          background-color: var(--green-hover);
        }

        /* Responsive Mobile Layout Adaptation (<= 820px) */
        @media (max-width: 820px) {
          .reelmark-hero-root {
            --u: calc(100vw / 640);
          }

          .reelmark-stage {
            width: 100vw;
            height: auto;
            min-height: auto;
            padding: 32px 0 44px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }

          .doodle-slashes,
          .note-beseen-group {
            display: none !important;
          }

          .hero-copy {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0 20px;
          }

          .reelmark-badge {
            position: static;
            transform: none;
            width: auto;
            padding: 0 16px;
            height: 33px;
            font-size: 13.5px;
            margin-bottom: 14px;
          }

          .reelmark-headline {
            position: static;
            font-size: clamp(36px, 9vw, 52px);
            line-height: 1.05;
            margin-bottom: 14px;
          }

          .reelmark-subline {
            position: static;
            font-size: 15.5px;
            line-height: 1.48;
            max-width: 380px;
          }

          .reelmark-subline span {
            display: inline;
          }

          .carousel-viewport {
            position: relative;
            width: 100vw;
            height: 250px;
            margin: 18px 0;
            overflow: hidden;
          }

          .card-play-badge {
            width: 22px;
            height: 22px;
            left: 9px;
            bottom: 9px;
          }

          .card-play-badge svg {
            width: 8px;
            height: 8px;
          }

          .bottom-cta-mobile {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
          }

          .cta-ring {
            position: relative;
            left: auto;
            top: auto;
            transform: none;
            width: auto;
            min-width: 178px;
            height: 68px;
            padding: 5px;
            border-width: 1.5px;
          }

          .cta-ring:hover {
            transform: scale(1.03);
          }

          .cta-ring:active {
            transform: scale(0.98);
          }

          .cta-pill {
            width: auto;
            min-width: 162px;
            height: 52px;
            padding: 0 24px;
            font-size: 16px;
          }

          .note-zerocost-group {
            position: absolute;
            left: -94px;
            top: 32px;
          }

          .note-zerocost-text {
            font-size: 21px;
          }

          .note-zerocost-arrow {
            left: 30px;
            top: -26px;
            width: 52px;
            height: 36px;
          }
        }
      `}</style>

      <div className="reelmark-stage" ref={containerRef}>
        {/* Hero Copy */}
        <div className="hero-copy">
          <div className="reelmark-badge" ref={badgeRef}>
            {badgeText}
          </div>

          <h1 className="reelmark-headline">
            <span className="line-1" ref={h1Line1Ref}>
              {headlineLine1}
            </span>
            <span className="line-2" ref={h1Line2Ref}>
              {headlineLine2}
            </span>
          </h1>

          <p className="reelmark-subline" ref={sublineRef}>
            {subline.map((line, idx) => (
              <span key={idx}>{line} </span>
            ))}
          </p>
        </div>

        {/* Hand-Drawn Notes & Doodles */}
        {/* "//" Doodle at (263, 337) */}
        <svg className="doodle-slashes" viewBox="0 0 50 48" aria-hidden="true">
          <path
            className="draw-stroke"
            d="M24 6 C 18 18, 12 31, 6 42"
            strokeWidth="3.2"
          />
          <path
            className="draw-stroke"
            d="M41 9 C 35 20, 28 32, 22 43"
            strokeWidth="3.2"
          />
        </svg>

        {/* "Be seen / with clips" rotated 16deg + long curving arrow */}
        <div className="note-beseen-group" aria-hidden="true">
          <div className="note-beseen-text" ref={note1Ref}>
            {note1Text}
          </div>
          <svg className="note-beseen-arrow" viewBox="0 0 115 135">
            <path
              className="draw-stroke"
              d="M 68 8 C 84 42, 66 94, 22 120"
              strokeWidth="2.5"
            />
            <path
              className="draw-stroke"
              d="M 35 123 L 20 121 L 27 107"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Curved Video Carousel (10 cards, 5x2 shared video atlas) */}
        <div
          className="carousel-viewport"
          ref={viewportRef}
          aria-label="Product video reels carousel"
        />

        {/* Bottom CTA Button + "Zero cost" Note */}
        <div className="bottom-cta-mobile">
          <div className="note-zerocost-group" aria-hidden="true">
            <div className="note-zerocost-text" ref={note2Ref}>
              {note2Text}
            </div>
            <svg className="note-zerocost-arrow" viewBox="0 0 68 48">
              <path
                className="draw-stroke"
                d="M 6 38 C 18 14, 38 10, 60 15"
                strokeWidth="2.4"
              />
              <path
                className="draw-stroke"
                d="M 50 7 L 62 15 L 49 23"
                strokeWidth="2.4"
              />
            </svg>
          </div>

          <a
            href={ctaLink}
            onClick={handleCtaClick}
            className="cta-ring"
            ref={ctaRef}
            aria-label={ctaText}
          >
            <span className="cta-pill">{ctaText}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
