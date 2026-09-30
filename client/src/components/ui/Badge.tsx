import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  blue: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  green: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  yellow: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  red: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  purple: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  slate: 'bg-zinc-800 text-zinc-300 border-zinc-700/70',
};

const dotColors = {
  blue: 'bg-blue-400',
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-rose-400',
  purple: 'bg-purple-400',
  slate: 'bg-zinc-400',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export default Badge;
