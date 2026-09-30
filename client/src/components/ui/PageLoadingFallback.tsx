import React from 'react';
import { Activity } from 'lucide-react';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fade-in-up">
      <div className="relative flex items-center justify-center mb-4">
        {/* Ambient glow */}
        <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        {/* Rotating ring spinner */}
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
        <Activity className="w-5 h-5 text-blue-400 absolute" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-zinc-200 tracking-wide">
          Loading Module...
        </h3>
        <p className="text-xs text-zinc-500 font-mono">
          Initializing clinical interface
        </p>
      </div>
    </div>
  );
};

export default PageLoadingFallback;
