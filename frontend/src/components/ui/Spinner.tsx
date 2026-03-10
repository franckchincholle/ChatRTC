'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'small' | 'normal';
  centered?: boolean;
}

export function Spinner({ size = 'normal', centered = false }: SpinnerProps) {
  const sizeClass =
    size === 'xs'    ? 'spinner-xs' :
    size === 'small' ? 'spinner-small' :
    '';

  const spinner = <div className={`spinner ${sizeClass}`.trim()} />;

  if (centered) {
    return <div className="spinner-center">{spinner}</div>;
  }

  return spinner;
}