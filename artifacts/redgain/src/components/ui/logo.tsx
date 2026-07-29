import React from 'react';

interface LogoProps {
  className?: string;
  /** Show only the bust image without the gold ring (default: false) */
  imageOnly?: boolean;
}

export function Logo({ className = "w-8 h-8", imageOnly = false }: LogoProps) {
  if (imageOnly) {
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

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #1a1206, #0E0A04)',
        boxShadow: '0 0 0 1.5px rgba(201,162,39,0.55), inset 0 0 8px rgba(201,162,39,0.08)',
      }}
    >
      <img
        src="/logo.png"
        alt="RedGain"
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.15)' }}
        draggable={false}
      />
    </div>
  );
}
