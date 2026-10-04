import React from 'react';

interface AiGlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const AiGlowLogo: React.FC<AiGlowLogoProps> = ({
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${currentSize} ${className}`}>
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 opacity-40 blur-xl ${
          animate ? 'animate-pulse' : ''
        }`}
      />

      {/* Main SVG Logo reproducing the neural spherical orb */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.5)] ${
          animate ? 'transition-transform duration-700 hover:scale-105' : ''
        }`}
      >
        <defs>
          <radialGradient id="aiCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#6366F1" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#A855F7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.2" />
          </radialGradient>

          <linearGradient id="aiRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#7000FF" />
            <stop offset="100%" stopColor="#FF007A" />
          </linearGradient>

          <linearGradient id="aiRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        {/* Back glow disc */}
        <circle cx="50" cy="50" r="42" fill="url(#aiCoreGlow)" />

        {/* External orbiting energy rings */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="18"
          stroke="url(#aiRingGrad1)"
          strokeWidth="2.2"
          strokeDasharray="6 3"
          transform="rotate(-28 50 50)"
          className={animate ? 'animate-[spin_12s_linear_infinite]' : ''}
          opacity="0.85"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="18"
          stroke="url(#aiRingGrad2)"
          strokeWidth="2.2"
          strokeDasharray="8 4"
          transform="rotate(38 50 50)"
          className={animate ? 'animate-[spin_16s_linear_infinite_reverse]' : ''}
          opacity="0.85"
        />

        {/* Central neural spherical ring matrix */}
        <circle
          cx="50"
          cy="50"
          r="28"
          stroke="url(#aiRingGrad1)"
          strokeWidth="3.5"
          className="drop-shadow-[0_0_8px_#38bdf8]"
        />

        <circle
          cx="50"
          cy="50"
          r="19"
          stroke="url(#aiRingGrad2)"
          strokeWidth="2"
          strokeDasharray="3 2"
        />

        {/* Core AI pupil / crystalline center */}
        <circle cx="50" cy="50" r="10" fill="#FFFFFF" className="drop-shadow-[0_0_12px_#FFFFFF]" />
        <circle cx="50" cy="50" r="6" fill="#0EA5E9" />

        {/* Neural nodes */}
        <circle cx="50" cy="22" r="2.5" fill="#38BDF8" />
        <circle cx="78" cy="50" r="2.5" fill="#C084FC" />
        <circle cx="50" cy="78" r="2.5" fill="#FF007A" />
        <circle cx="22" cy="50" r="2.5" fill="#00F0FF" />
      </svg>
    </div>
  );
};
