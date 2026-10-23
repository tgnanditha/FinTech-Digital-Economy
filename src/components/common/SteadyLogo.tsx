import React from 'react';

export const SteadyLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-forest ${className}`}>
      {/* Upward growth & baseline stability geometric emblem */}
      <div className={`${iconSize} rounded-md bg-forest flex items-center justify-center p-1 text-mint shadow-xs shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Baseline horizontal line indicating safety floor */}
          <line x1="3" y1="20" x2="21" y2="20" />
          {/* Ascending steady step curve */}
          <polyline points="4 16 10 16 15 9 20 9" />
          <polyline points="16 5 20 9 16 13" />
        </svg>
      </div>
      <span className={`${textSize} font-bold tracking-tight text-forest`}>
        Steady
      </span>
    </div>
  );
};
