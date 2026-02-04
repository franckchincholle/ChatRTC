'use client';

import React, { useEffect } from 'react';

interface NotificationProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification notification-${type}`}>
      {message}
    </div>
  );
}