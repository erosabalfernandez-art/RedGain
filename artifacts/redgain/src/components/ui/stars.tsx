import React, { useMemo } from 'react';

interface StarsProps {
  count?: number;
  className?: string;
}

export function Stars({ count = 30, className = "" }: StarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const isBlue = Math.random() > 0.7;
      const size = Math.random() * 4 + 1;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${size}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 4 + 2}s`,
        opacity: Math.random() * 0.5 + 0.3,
        className: isBlue ? 'star-blue' : 'star'
      };
    });
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={star.className}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            '--delay': star.delay,
            '--duration': star.duration,
            '--max-opacity': star.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
