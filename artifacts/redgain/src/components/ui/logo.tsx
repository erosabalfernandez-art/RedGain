import React from 'react';

export function Logo({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-grad-primary" x1="0" y1="100" x2="100" y2="0">
          <stop offset="0%" stopColor="#1A3EBF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="logo-grad-accent" x1="0" y1="100" x2="100" y2="0">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="28" cy="72" r="8" fill="url(#logo-grad-primary)" opacity="0.9" />
      <path 
        d="M28 72 V28 H58 C72 28 78 36 78 46 C78 54 72 62 60 62 H44" 
        stroke="url(#logo-grad-primary)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M50 62 L78 90" 
        stroke="url(#logo-grad-accent)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M78 90 L78 70 M78 90 L58 90" 
        stroke="url(#logo-grad-accent)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
