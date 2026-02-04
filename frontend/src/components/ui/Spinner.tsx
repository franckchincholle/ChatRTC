'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'normal';
}

export function Spinner({ size = 'normal' }: SpinnerProps) {
  return (
    <div className={`spinner ${size === 'small' ? 'spinner-small' : ''}`} />
  );
}