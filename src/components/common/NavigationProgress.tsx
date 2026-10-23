import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationProgress
 * 
 * Provides smooth circular radial transition aura and automatic scroll restoration 
 * on client-side route transitions using a single uniform dark color.
 */
export const NavigationProgress: React.FC = () => {
  const location = useLocation();
  const [showRadialAura, setShowRadialAura] = useState(false);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only animate on actual path changes (not pure query parameter shifts)
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      // 1. Scroll to top instantly unless navigating to an on-page anchor (#hash)
      if (!location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        const targetEl = document.querySelector(location.hash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // 2. Trigger Circular Bloom Aura
      setShowRadialAura(true);
      const auraTimer = setTimeout(() => {
        setShowRadialAura(false);
      }, 550);

      // 3. Shift focus to main container for accessibility screen readers
      const mainEl = document.querySelector('main');
      if (mainEl && !mainEl.hasAttribute('tabindex')) {
        mainEl.setAttribute('tabindex', '-1');
        mainEl.focus({ preventScroll: true });
      }

      return () => {
        clearTimeout(auraTimer);
      };
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      {/* Corner-to-Corner Circular Ripple Wavefront (Single Solid Dark Color) */}
      {showRadialAura && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden"
        >
          {/* Circular ripple ring expanding from top-left corner across to bottom-right corner - Single Solid Dark Color */}
          <div className="absolute top-0 left-0 rounded-full border-[2.5px] border-[#111827] bg-transparent animate-corner-circle" />

          {/* Matching subtle glow in the exact same single dark color */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_top_left,_rgba(17,24,39,0.25)_0%,_transparent_70%)] blur-2xl pointer-events-none" />
        </div>
      )}
    </>
  );
};
