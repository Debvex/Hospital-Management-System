import React from 'react';
import { LucideIcon } from 'lucide-react';

export type GoogleColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal' | 'slate';
export type GoogleIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GoogleIconCircleProps {
  icon: LucideIcon;
  color?: GoogleColor;
  size?: GoogleIconSize;
  className?: string;
  badge?: string | number;
  interactive?: boolean;
  onClick?: () => void;
  title?: string;
}

// Google App palette: soft pastel filled circular background with ultra-crisp solid black icon inside
const colorStyles: Record<GoogleColor, string> = {
  blue: 'bg-[#D3E3FD] border-[#B8D3F9]',      // Google Phone / Docs blue
  green: 'bg-[#C4EED0] border-[#A8E2B9]',     // Google Meet / Sheet green
  yellow: 'bg-[#FEEFC3] border-[#FCE293]',    // Google Keep amber/yellow
  red: 'bg-[#FAD2CF] border-[#F6AEA9]',       // Google Gmail red
  purple: 'bg-[#E8DEF8] border-[#D0BCFF]',    // Google Tasks purple
  teal: 'bg-[#C2E7FF] border-[#A3D9FF]',      // Google Assistant / Pixel teal
  slate: 'bg-[#E2E8F0] border-[#CBD5E1]',     // Minimalist neutral
};

const sizeStyles: Record<GoogleIconSize, { container: string; icon: string }> = {
  xs: { container: 'w-6 h-6', icon: 'w-3.5 h-3.5' },
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  xl: { container: 'w-14 h-14', icon: 'w-7 h-7' },
};

/**
 * Google-themed circular icon button/badge.
 * Features a soft tinted filled circle with a high-contrast pure black icon inside.
 */
export const GoogleIconCircle: React.FC<GoogleIconCircleProps> = ({
  icon: Icon,
  color = 'blue',
  size = 'md',
  className = '',
  badge,
  interactive = false,
  onClick,
  title,
}) => {
  const { container, icon: iconSize } = sizeStyles[size];
  const colorClass = colorStyles[color];

  return (
    <div className="relative inline-flex shrink-0">
      <div
        title={title}
        onClick={onClick}
        className={`
          ${container}
          ${colorClass}
          rounded-full flex items-center justify-center
          border border-transparent
          transition-transform duration-150 ease-out
          ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm' : ''}
          ${className}
        `}
      >
        {/* The main icon inside is strictly solid black for maximum accessibility and visual clarity */}
        <Icon className={`${iconSize} text-black stroke-[2.2]`} />
      </div>

      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#18191e] tabular-nums">
          {badge}
        </span>
      )}
    </div>
  );
};

export default GoogleIconCircle;
