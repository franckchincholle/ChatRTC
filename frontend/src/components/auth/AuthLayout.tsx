'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">R</div>
          <span className="auth-logo-name">RTC</span>
        </div>
        {children}
      </div>
    </div>
  );
}