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

// 24 organically dispersed petals with staggered negative delays
const PETALS_DATA: PetalConfig[] = [
  { id: 1, left: 3, size: 17, fallDuration: 12.5, fallDelay: -2.4, swayClass: 'petal-sway-a', swayDelay: -1.2, drift: 24, maxOpacity: 0.72, type: 0 },
  { id: 2, left: 8, size: 14, fallDuration: 15.0, fallDelay: -9.8, swayClass: 'petal-sway-b', swayDelay: -3.5, drift: -18, maxOpacity: 0.65, type: 1 },
  { id: 3, left: 13, size: 20, fallDuration: 11.2, fallDelay: -5.1, swayClass: 'petal-sway-c', swayDelay: -0.8, drift: 32, maxOpacity: 0.78, type: 2 },
  { id: 4, left: 18, size: 12, fallDuration: 16.4, fallDelay: -12.3, swayClass: 'petal-sway-a', swayDelay: -4.1, drift: -14, maxOpacity: 0.58, type: 3 },
  { id: 5, left: 23, size: 18, fallDuration: 13.8, fallDelay: -3.7, swayClass: 'petal-sway-b', swayDelay: -2.3, drift: 20, maxOpacity: 0.75, type: 0 },
  { id: 6, left: 28, size: 15, fallDuration: 14.5, fallDelay: -8.5, swayClass: 'petal-sway-c', swayDelay: -5.0, drift: -22, maxOpacity: 0.68, type: 1 },
  { id: 7, left: 33, size: 21, fallDuration: 10.8, fallDelay: -1.5, swayClass: 'petal-sway-a', swayDelay: -1.8, drift: 28, maxOpacity: 0.80, type: 0 },
  { id: 8, left: 38, size: 13, fallDuration: 15.8, fallDelay: -11.0, swayClass: 'petal-sway-b', swayDelay: -3.2, drift: -16, maxOpacity: 0.60, type: 2 },
  { id: 9, left: 43, size: 19, fallDuration: 12.0, fallDelay: -6.4, swayClass: 'petal-sway-c', swayDelay: -2.7, drift: 26, maxOpacity: 0.74, type: 1 },
  { id: 10, left: 48, size: 11, fallDuration: 17.2, fallDelay: -14.2, swayClass: 'petal-sway-a', swayDelay: -4.5, drift: -12, maxOpacity: 0.55, type: 3 },
  { id: 11, left: 53, size: 22, fallDuration: 11.5, fallDelay: -4.2, swayClass: 'petal-sway-b', swayDelay: -1.0, drift: 30, maxOpacity: 0.82, type: 0 },
  { id: 12, left: 58, size: 16, fallDuration: 14.2, fallDelay: -10.1, swayClass: 'petal-sway-c', swayDelay: -3.8, drift: -20, maxOpacity: 0.70, type: 2 },
  { id: 13, left: 63, size: 18, fallDuration: 13.0, fallDelay: -2.9, swayClass: 'petal-sway-a', swayDelay: -2.1, drift: 25, maxOpacity: 0.76, type: 1 },
  { id: 14, left: 68, size: 12, fallDuration: 16.0, fallDelay: -13.5, swayClass: 'petal-sway-b', swayDelay: -4.8, drift: -15, maxOpacity: 0.58, type: 3 },
  { id: 15, left: 73, size: 20, fallDuration: 12.2, fallDelay: -7.6, swayClass: 'petal-sway-c', swayDelay: -1.6, drift: 28, maxOpacity: 0.77, type: 0 },
  { id: 16, left: 78, size: 15, fallDuration: 14.8, fallDelay: -3.3, swayClass: 'petal-sway-a', swayDelay: -3.4, drift: -24, maxOpacity: 0.66, type: 2 },
  { id: 17, left: 83, size: 17, fallDuration: 13.4, fallDelay: -11.8, swayClass: 'petal-sway-b', swayDelay: -2.5, drift: 18, maxOpacity: 0.73, type: 1 },
  { id: 18, left: 88, size: 13, fallDuration: 15.5, fallDelay: -5.7, swayClass: 'petal-sway-c', swayDelay: -4.0, drift: -18, maxOpacity: 0.62, type: 3 },
  { id: 19, left: 93, size: 21, fallDuration: 11.0, fallDelay: -8.9, swayClass: 'petal-sway-a', swayDelay: -1.4, drift: 26, maxOpacity: 0.79, type: 0 },
  { id: 20, left: 97, size: 14, fallDuration: 16.8, fallDelay: -15.1, swayClass: 'petal-sway-b', swayDelay: -5.2, drift: -14, maxOpacity: 0.64, type: 1 },
  { id: 21, left: 16, size: 16, fallDuration: 13.2, fallDelay: -7.2, swayClass: 'petal-sway-a', swayDelay: -2.9, drift: 22, maxOpacity: 0.68, type: 2 },
  { id: 22, left: 51, size: 19, fallDuration: 12.8, fallDelay: -1.8, swayClass: 'petal-sway-c', swayDelay: -0.5, drift: -25, maxOpacity: 0.76, type: 0 },
  { id: 23, left: 76, size: 12, fallDuration: 15.2, fallDelay: -9.1, swayClass: 'petal-sway-b', swayDelay: -3.7, drift: 16, maxOpacity: 0.58, type: 3 },
  { id: 24, left: 85, size: 18, fallDuration: 13.6, fallDelay: -4.9, swayClass: 'petal-sway-a', swayDelay: -1.9, drift: -22, maxOpacity: 0.74, type: 0 },
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
