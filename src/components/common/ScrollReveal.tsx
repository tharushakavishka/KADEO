import React, { useRef, useState, useEffect } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animationStyle?: 'slide-up' | 'scale' | 'fade';
  enabled?: boolean;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 600,
  animationStyle = 'slide-up',
  enabled = true,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Detect scroll parent: either window or an ancestor with overflow-y: auto / scroll
    let scrollParent: HTMLElement | Window = window;
    let curr = element.parentElement;
    while (curr) {
      const style = window.getComputedStyle(curr);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollParent = curr;
        break;
      }
      curr = curr.parentElement;
    }

    const checkInView = () => {
      if (!element) return;
      const rect = element.getBoundingClientRect();

      let parentTop = 0;
      let parentBottom = window.innerHeight;

      if (scrollParent !== window) {
        const parentRect = (scrollParent as HTMLElement).getBoundingClientRect();
        parentTop = parentRect.top;
        parentBottom = parentRect.bottom;
      }

      // Check if element is within viewport with generous bottom threshold
      if (rect.top <= parentBottom + 60 && rect.bottom >= parentTop - 60) {
        setIsVisible(true);
      }
    };

    // Check multiple times on mount to catch layout renders
    checkInView();
    const t1 = setTimeout(checkInView, 80);
    const t2 = setTimeout(checkInView, 250);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkInView();
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      scrollParent.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  // Determine hidden state transform based on animationStyle
  let hiddenTransform = 'opacity-0 translate-y-8 scale-[0.98]';
  if (animationStyle === 'scale') {
    hiddenTransform = 'opacity-0 scale-90 translate-y-3';
  } else if (animationStyle === 'fade') {
    hiddenTransform = 'opacity-0';
  }

  const visibleTransform = 'opacity-100 translate-y-0 scale-100';

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
      className={`transition-all ${isVisible ? visibleTransform : hiddenTransform} ${className}`}
    >
      {children}
    </div>
  );
};
