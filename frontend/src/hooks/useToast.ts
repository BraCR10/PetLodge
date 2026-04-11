import { useRef, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: ToastType, onDismiss?: () => void, duration = 2000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, message, type });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      onDismiss?.();
    }, duration);
  };

  return { toast, showToast };
};
