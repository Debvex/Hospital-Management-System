import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'google';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer whitespace-nowrap';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  };

  const variantClasses = {
    // Google primary blue button
    primary:
      'bg-blue-600 text-white hover:bg-blue-500 shadow-sm hover:shadow focus-visible:ring-blue-400',
    // Google Material dark tonal button
    secondary:
      'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-600',
    // Minimalist dark outline
    outline:
      'border border-zinc-700/80 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 focus-visible:ring-zinc-600',
    // Danger
    danger:
      'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
    // Ghost
    ghost:
      'text-zinc-300 hover:bg-zinc-800 focus-visible:ring-zinc-600',
    // Signature Google Pill style (filled pastel blue with crisp black text)
    google:
      'bg-[#D3E3FD] text-black font-bold hover:bg-[#C2D8FC] border border-[#B8D3F9] focus-visible:ring-blue-400 shadow-xs',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
