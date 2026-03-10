'use client';

import React, { useEffect } from 'react';

type NotificationType = 'error' | 'success' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const icons: Record<NotificationType, string> = {
  error:   '✕',
  success: '✓',
  info:    'i',
  warning: '!',
};

export function Notification({
  type,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`notification notification-${type}`}
      role="alert"
      aria-live="assertive"
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icons[type]}
      </span>
      <span className="notification-message">{message}</span>
      <button
        className="notification-close"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        ×
      </button>
    </div>
  );
}