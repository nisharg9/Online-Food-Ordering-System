// context/ToastContext.jsx
// Provides a global toast/snackbar notification system
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: <CheckCircle size={18} className="text-green-600 shrink-0" />,
  error: <XCircle size={18} className="text-red-500 shrink-0" />,
  info: <Info size={18} className="text-blue-500 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
};

const BG_CLASSES = {
  success: 'bg-[#F0FAF4] border-[#A8D5BA]',
  error: 'bg-[#FFF0F0] border-[#FF6B6B]',
  info: 'bg-[#EFF6FF] border-blue-300',
  warning: 'bg-[#FFFBEB] border-amber-300',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto
              animate-toast-in ${BG_CLASSES[t.type]}`}
          >
            {ICONS[t.type]}
            <p className="text-sm text-[#333333] flex-1 font-medium">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
