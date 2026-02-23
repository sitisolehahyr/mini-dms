import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import Icon from "../components/ui/Icon";

type ToastType = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: number;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type = "info", durationMs = 3200 }: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, title, description, type, durationMs }]);
      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <article key={toast.id} className={`ui-toast ui-toast-${toast.type}`}>
            <span className="ui-toast-icon">
              {toast.type === "success" ? (
                <Icon name="check" size={16} />
              ) : toast.type === "error" ? (
                <Icon name="alert" size={16} />
              ) : (
                <Icon name="clock" size={16} />
              )}
            </span>
            <div className="ui-toast-content">
              <strong>{toast.title}</strong>
              {toast.description ? <p>{toast.description}</p> : null}
            </div>
            <button type="button" onClick={() => removeToast(toast.id)} className="ui-toast-close" aria-label="Dismiss">
              ×
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
