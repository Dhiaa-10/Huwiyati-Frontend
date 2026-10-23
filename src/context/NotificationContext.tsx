"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  UnifiedDialog,
  DialogOptions,
  DialogType,
} from "@/components/ui/unified-dialog";
import {
  UnifiedToastContainer,
  ToastItem,
  ToastType,
} from "@/components/ui/unified-toast";
import { translateBackendError } from "@/lib/utils/errorTranslator";

export interface ConfirmOptions {
  title?: string;
  message: string | React.ReactNode;
  type?: DialogType;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertOptions {
  title?: string;
  message: string | React.ReactNode;
  type?: DialogType;
  icon?: React.ReactNode;
  confirmText?: string;
}

export interface ToastMethods {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  show: (type: ToastType, message: string, duration?: number) => void;
}

export interface NotificationContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
  alert: (options: string | AlertOptions) => Promise<void>;
  toast: ToastMethods;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Global dispatcher reference for non-React call sites if needed
export let globalNotification: NotificationContextType = {
  confirm: async () => false,
  alert: async () => {},
  toast: {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    show: () => {},
  },
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const translated = typeof message === "string" ? translateBackendError(message) : message;
      const newToast: ToastItem = { id, type, message: translated, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toastMethods: ToastMethods = {
    success: (msg, dur) => showToast("success", msg, dur),
    error: (msg, dur) => showToast("error", msg, dur),
    warning: (msg, dur) => showToast("warning", msg, dur),
    info: (msg, dur) => showToast("info", msg, dur),
    show: showToast,
  };

  const confirm = useCallback(
    (options: string | ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        const normalized: DialogOptions =
          typeof options === "string"
            ? {
                message: translateBackendError(options),
                isConfirm: true,
                type: "warning",
              }
            : {
                ...options,
                message:
                  typeof options.message === "string"
                    ? translateBackendError(options.message)
                    : options.message,
                isConfirm: true,
              };

        setDialogOptions(normalized);
        setDialogOpen(true);
      });
    },
    []
  );

  const alert = useCallback(
    (options: string | AlertOptions): Promise<void> => {
      return new Promise<void>((resolve) => {
        resolverRef.current = () => resolve();
        const normalized: DialogOptions =
          typeof options === "string"
            ? {
                message: translateBackendError(options),
                isConfirm: false,
                type: "info",
              }
            : {
                ...options,
                message:
                  typeof options.message === "string"
                    ? translateBackendError(options.message)
                    : options.message,
                isConfirm: false,
              };

        setDialogOptions(normalized);
        setDialogOpen(true);
      });
    },
    []
  );

  const handleDialogConfirm = useCallback(() => {
    setDialogOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  // Update global reference
  globalNotification = {
    confirm,
    alert,
    toast: toastMethods,
  };

  // Monkey-patch window.alert to prevent native blocking alert dialogs across the app
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;

      // Safe non-blocking replacement
      window.alert = (message?: any) => {
        const text =
          typeof message === "string" ? message : JSON.stringify(message);
        alert({
          title: "تنبيه المنظومة",
          message: text,
          type: "warning",
          confirmText: "حسناً، فهمت",
        });
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, [alert]);

  return (
    <NotificationContext.Provider value={{ confirm, alert, toast: toastMethods }}>
      {children}

      {/* Global Dialog Modal */}
      <UnifiedDialog
        isOpen={dialogOpen}
        options={dialogOptions}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      {/* Global Toasts */}
      <UnifiedToastContainer toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    return globalNotification;
  }
  return context;
}

export function useConfirm() {
  return useNotification().confirm;
}

export function useAlert() {
  return useNotification().alert;
}

export function useToast() {
  return useNotification().toast;
}
