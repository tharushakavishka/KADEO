import React, { useEffect, useState } from 'react';
import logoImg from '../../assets/logo.png';

interface SplashScreenProps {
  isLoading: boolean;
  minDuration?: number; // Minimum time in ms to display splash (default: 900)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isLoading,
  minDuration = 900,
}) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  // Guarantee minimum display time for smooth visual aesthetic
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    // Safeguard: Force dismiss after 2.5s maximum so user is never blocked
    const maxTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [minDuration]);

  // When loading finishes AND minimum display time has elapsed, trigger fade-out
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setIsFading(true);
      const unmountTimer = setTimeout(() => {
        setIsRendered(false);
      }, 450); // Matches transition duration
      return () => clearTimeout(unmountTimer);
    }
  }, [isLoading, minTimeElapsed]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading Kadeo Commerce"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white select-none transition-opacity duration-400 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo Container with smooth scale/fade animation */}
        <div className="mb-6 transform transition-transform duration-500 ease-out animate-in fade-in zoom-in-95">
          <img
            src={logoImg}
            alt="Kadeo"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
            loading="eager"
          />
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-medium tracking-tight text-neutral-500 mb-8 max-w-xs">
          Your Shop. Your Customers. Your Growth.
        </p>

        {/* Sleek Minimalist Loading Bar */}
        <div className="w-48 sm:w-56 h-1 bg-neutral-100 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 left-0 bg-[#10B981] rounded-full animate-kadeo-loader" />
        </div>

        {/* Sri Lanka Curated Commerce badge */}
        <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
          <span>Independent Boutiques • Sri Lanka</span>
        </div>
      </div>
    </div>
  );
};
