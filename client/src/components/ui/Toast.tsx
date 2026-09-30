import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import GoogleIconCircle from './GoogleIconCircle';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  code?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string, code?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, description, code, duration = 4500 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, description, code, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, code?: string) => {
    addToast({ type: 'error', title, description, code, duration: 6000 });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      {/* Toast container floating on top-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let color: 'green' | 'red' | 'yellow' | 'blue' = 'blue';
          let Icon = Info;
          if (t.type === 'success') {
            color = 'green';
            Icon = CheckCircle2;
          } else if (t.type === 'error') {
            color = 'red';
            Icon = AlertCircle;
          } else if (t.type === 'warning') {
            color = 'yellow';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={t.id}
              role="alert"
              className="pointer-events-auto flex items-start gap-3 p-4 bg-[#181a20]/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800 text-zinc-100 transition-all animate-in slide-in-from-bottom-5 duration-200"
            >
              <GoogleIconCircle icon={Icon} color={color} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-zinc-100 leading-tight">{t.title}</h4>
                  {t.code && (
                    <span className="font-mono text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">
                      {t.code}
                    </span>
                  )}
                </div>
                {t.description && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full shrink-0"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
