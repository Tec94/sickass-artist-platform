import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export const FlashlightEffect = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(({ children, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useImperativeHandle(ref, () => containerRef.current!);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`flashlight-container ${className || ''}`}>
      {children}
      <style>{`
        .flashlight-container {
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
      `}</style>
    </div>
  );
});
