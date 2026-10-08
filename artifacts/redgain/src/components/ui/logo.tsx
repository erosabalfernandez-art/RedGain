import React from 'react';

interface LogoProps {
  className?: string;
  /** Se mantiene por compatibilidad; el logo ya es solo la R de RedGain. */
  imageOnly?: boolean;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="RedGain"
      className={className}
      style={{ objectFit: 'contain' }}
      draggable={false}
    />
  );
}
