import { useEffect, useRef } from 'react';

export const useScrollAnimation = (options = { threshold: 0.1, rootMargin: '0px' }) => {
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.classList.add('animate-in');
          // Once animated, we might want to stop observing if we don't need re-triggering
          // But user said "both" which usually implies it can go back and forth 
          // However, for entry animations, usually one-way is fine. 
          // I'll stick to one-way for now unless specified "on scroll both directions".
          // "Animate when in view observed" - I'll keep it simple.
        }
      });
    }, options);

    const currentElements = elementsRef.current;
    currentElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      currentElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [options]);

  const addToRef = (el: HTMLElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return addToRef;
};
