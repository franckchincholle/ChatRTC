'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">RTC - Real Time Chat</h1>
        {children}
      </div>
    </div>
  );
}