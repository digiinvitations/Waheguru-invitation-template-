import React, { useMemo } from 'react';

interface PetalConfig {
  id: number;
  left: number; // percentage across screen 0-100%
  size: number; // width in pixels
  fallDuration: number; // seconds
  fallDelay: number; // negative seconds for immediate staggered flow
  swayClass: 'petal-sway-a' | 'petal-sway-b' | 'petal-sway-c';
  swayDelay: number; // seconds
  drift: number; // horizontal drift offset in px
  maxOpacity: number;
  type: 0 | 1 | 2 | 3;
}

// Low-density, sparsely dispersed petals for a subtle, elegant ambient drift
const PETALS_DATA: PetalConfig[] = [
  { id: 1, left: 8, size: 16, fallDuration: 14.5, fallDelay: -3.2, swayClass: 'petal-sway-a', swayDelay: -1.2, drift: 20, maxOpacity: 0.58, type: 0 },
  { id: 2, left: 21, size: 13, fallDuration: 17.0, fallDelay: -11.5, swayClass: 'petal-sway-b', swayDelay: -3.5, drift: -16, maxOpacity: 0.50, type: 1 },
  { id: 3, left: 36, size: 18, fallDuration: 13.8, fallDelay: -6.4, swayClass: 'petal-sway-c', swayDelay: -0.8, drift: 24, maxOpacity: 0.62, type: 2 },
  { id: 4, left: 52, size: 12, fallDuration: 18.2, fallDelay: -14.0, swayClass: 'petal-sway-a', swayDelay: -4.1, drift: -14, maxOpacity: 0.48, type: 3 },
  { id: 5, left: 65, size: 17, fallDuration: 15.2, fallDelay: -4.8, swayClass: 'petal-sway-b', swayDelay: -2.3, drift: 18, maxOpacity: 0.56, type: 0 },
  { id: 6, left: 78, size: 14, fallDuration: 16.5, fallDelay: -9.7, swayClass: 'petal-sway-c', swayDelay: -3.8, drift: -18, maxOpacity: 0.52, type: 1 },
  { id: 7, left: 89, size: 19, fallDuration: 13.5, fallDelay: -1.8, swayClass: 'petal-sway-a', swayDelay: -1.5, drift: 22, maxOpacity: 0.60, type: 2 },
  { id: 8, left: 30, size: 11, fallDuration: 19.0, fallDelay: -16.2, swayClass: 'petal-sway-b', swayDelay: -4.6, drift: 12, maxOpacity: 0.45, type: 3 },
  { id: 9, left: 95, size: 15, fallDuration: 15.8, fallDelay: -8.1, swayClass: 'petal-sway-c', swayDelay: -2.7, drift: -15, maxOpacity: 0.52, type: 0 },
];

interface PetalShapeProps {
  type: 0 | 1 | 2 | 3;
  id: number;
  size: number;
}

function PetalShape({ type, id, size }: PetalShapeProps) {
  // Height proportional to width
  const height = Math.round(size * 1.25);

  switch (type) {
    case 0: // Deep Rose Velvet Petal
      return (
        <svg
          viewBox="0 0 28 34"
          width={size}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_4px_rgba(143,23,54,0.18)]"
        >
          <defs>
            <linearGradient id={`roseGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E88297" />
              <stop offset="50%" stopColor="#C93B5B" />
              <stop offset="100%" stopColor="#82142F" />
            </linearGradient>
            <linearGradient id={`roseSheen-${id}`} x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M14 2C7.5 2 2 7.5 2 15C2 23.5 9 31 14 33C19 31 26 23.5 26 15C26 7.5 20.5 2 14 2Z"
            fill={`url(#roseGrad-${id})`}
          />
          <path
            d="M14 4C8.5 4 4.5 8.5 4.5 15C4.5 20 8.5 26 14 28.5C12 21 12 11 14 4Z"
            fill={`url(#roseSheen-${id})`}
          />
        </svg>
      );

    case 1: // Soft Blush Curved Petal
      return (
        <svg
          viewBox="0 0 26 32"
          width={size}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_4px_rgba(179,46,78,0.14)]"
        >
          <defs>
            <linearGradient id={`blushGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE3E9" />
              <stop offset="45%" stopColor="#F29BB0" />
              <stop offset="100%" stopColor="#C24967" />
            </linearGradient>
          </defs>
          <path
            d="M13 1.5C6.5 2.5 1.5 8.5 2 16.5C2.5 24 8.5 30 13 31.5C17.5 30 24 23 24 14.5C24 6.5 18 1 13 1.5Z"
            fill={`url(#blushGrad-${id})`}
          />
          <path
            d="M13 1.5C16 5.5 18.5 11 17.5 19C16 25 13 29.5 13 31.5C16.5 25 21.5 19 21 12.5C20.5 7 17 3 13 1.5Z"
            fill="rgba(255, 255, 255, 0.4)"
          />
        </svg>
      );

    case 2: // Warm Golden Rose / Saffron Blush Petal
      return (
        <svg
          viewBox="0 0 24 30"
          width={size}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_4px_rgba(169,31,61,0.15)]"
        >
          <defs>
            <linearGradient id={`goldGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE4CE" />
              <stop offset="40%" stopColor="#F4A28C" />
              <stop offset="100%" stopColor="#B83A58" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C6.5 3.5 3 9 3 16C3 23 8.5 28 12 29.5C15.5 28 21 23 21 16C21 9 17.5 3.5 12 2Z"
            fill={`url(#goldGrad-${id})`}
          />
        </svg>
      );

    case 3: // Petite Floating Blossom Petal
    default:
      return (
        <svg
          viewBox="0 0 20 26"
          width={Math.round(size * 0.9)}
          height={Math.round(height * 0.9)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_3px_rgba(217,149,165,0.2)]"
        >
          <defs>
            <linearGradient id={`petiteGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F8C4D0" />
              <stop offset="100%" stopColor="#D9637E" />
            </linearGradient>
          </defs>
          <path
            d="M10 1.5C5 2.5 1.5 7 1.5 13C1.5 19 6.5 24 10 25.5C13.5 24 18.5 19 18.5 13C18.5 7 15 2.5 10 1.5Z"
            fill={`url(#petiteGrad-${id})`}
          />
        </svg>
      );
  }
}

export function FallingPetals() {
  const petals = useMemo(() => PETALS_DATA, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-25 overflow-hidden select-none"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-0"
          style={
            {
              left: `${petal.left}%`,
              animation: `petalFall ${petal.fallDuration}s linear infinite`,
              animationDelay: `${petal.fallDelay}s`,
              '--petal-max-opacity': petal.maxOpacity,
              '--petal-drift': `${petal.drift}px`,
              willChange: 'transform, opacity',
            } as React.CSSProperties
          }
        >
          <div
            className={petal.swayClass}
            style={{
              animationDelay: `${petal.swayDelay}s`,
            }}
          >
            <PetalShape type={petal.type} id={petal.id} size={petal.size} />
          </div>
        </div>
      ))}
    </div>
  );
}
