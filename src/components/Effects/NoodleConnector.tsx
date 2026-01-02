import React from 'react';

export const NoodleConnector: React.FC<{ start: { x: number, y: number }, end: { x: number, y: number } }> = ({ start, end }) => {
  // Simple quadratic bezier curve
  const midX = (start.x + end.x) / 2;
  const path = `M ${start.x} ${start.y} Q ${midX} ${start.y}, ${end.x} ${end.y}`;

  return (
    <svg className="noodle-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
      <path d={path} fill="none" stroke="#222" strokeWidth="2" />
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="10, 100" className="beam-path" />
      <style>{`
        .beam-path {
          animation: beam-move 3s linear infinite;
        }
        @keyframes beam-move {
          from { stroke-dashoffset: 110; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
};
