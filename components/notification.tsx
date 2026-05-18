"use client";

import { useEffect, useRef, useState } from "react";

export type NotificationType = "success" | "error";

type NotificationProps = {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose: () => void;
};

export function Notification({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: NotificationProps) {
  const [visible, setVisible] = useState(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onCloseRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, type, duration]);

  if (!visible) return null;

  const bg =
    type === "error"
      ? "bg-red-600 shadow-red-900/20"
      : "bg-emerald-600 shadow-emerald-900/20";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 left-1/2 z-[100] flex max-w-md -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${bg}`}
    >
      {type === "success" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onCloseRef.current();
        }}
        className="rounded p-0.5 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
