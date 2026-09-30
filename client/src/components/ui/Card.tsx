import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-[#181a20] rounded-3xl border border-zinc-800 p-5 md:p-6 text-zinc-100
        ${hoverable ? 'hover:border-zinc-700 hover:shadow-lg transition-all duration-200' : 'shadow-xs'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <h3 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight leading-snug">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default Card;
