import React, { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  delay?: number; // in milliseconds
  threshold?: number;
  rootMargin?: string;
  direction?: 'up' | 'down' | 'none';
  distance?: number; // in pixels
}

/**
 * High-performance IntersectionObserver component that gracefully fades in
 * and slides up sections and cards as they enter the viewport during scrolling.
 */
export function FadeInSection({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  direction = 'up',
  distance = 32,
}: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = domRef.current;
    if (!element) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    if (direction === 'up') return `translate3d(0, ${distance}px, 0)`;
    if (direction === 'down') return `translate3d(0, -${distance}px, 0)`;
    return 'translate3d(0, 0, 0)';
  };

  return (
    <div
      ref={domRef}
      className={`will-change-[transform,opacity] transition-[opacity,transform] duration-1000 ease-out ${className} ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        transform: getTransform(),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Hook variant for components that want direct ref/visibility control
 */
export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isVisible] as const;
}
