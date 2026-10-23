import React from 'react';
import logoImg from '../../assets/logo.png';

export interface KadeoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const KadeoLogo: React.FC<KadeoLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
  showSubtitle = false,
}) => {
  const isDark = theme === 'dark';

  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`inline-flex flex-col items-start shrink-0 ${className}`}>
      <img
        src={logoImg}
        alt="Kadeo"
        className={`${sizeClasses[size]} w-auto max-w-full object-contain select-none transition-all duration-200 ${
          isDark ? 'brightness-0 invert opacity-95' : ''
        }`}
        loading="eager"
      />
      {showSubtitle && (
        <span
          className={`text-[9px] font-semibold tracking-wider uppercase mt-1 ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          Curated Commerce
        </span>
      )}
    </div>
  );
};
