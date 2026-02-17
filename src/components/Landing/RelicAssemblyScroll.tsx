import { useRef, useEffect, useState } from 'react';
import { MotionValue, useTransform, useMotionValueEvent } from 'framer-motion';

// --- Constants ---
const FRAME_COUNT = 120;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// Helper to generate image paths
const getFramePath = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(3, '0');
  return `/scroll-sequence/ezgif-frame-${paddedIndex}.webp`;
};

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function RelicAssemblyScroll({ scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  // Map scroll progress to frame index (0 -> FRAME_COUNT - 1)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // State to track loaded images
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Image cache
  const imageCache = useRef<Map<number, HTMLImageElement | ImageBitmap>>(new Map());

  // --- Resize canvas to fill container ---
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const dpr = window.devicePixelRatio || 1;
      // Calculate contain-fit dimensions
      const containerAspect = clientWidth / clientHeight;
      const imageAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      let drawWidth: number, drawHeight: number;
      if (containerAspect > imageAspect) {
        drawHeight = clientHeight;
        drawWidth = drawHeight * imageAspect;
      } else {
        drawWidth = clientWidth;
        drawHeight = drawWidth / imageAspect;
      }
      setCanvasSize({
        width: Math.round(drawWidth * dpr),
        height: Math.round(drawHeight * dpr),
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- Preloading Logic ---
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const promises = [];

      for (let i = 0; i < FRAME_COUNT; i++) {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.src = getFramePath(i);
          img.onload = async () => {
            if (!isMounted) return;
            try {
              const bitmap = await createImageBitmap(img);
              imageCache.current.set(i, bitmap);
            } catch {
              imageCache.current.set(i, img);
            }
            setImagesLoaded((prev) => prev + 1);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load frame ${i}: ${getFramePath(i)}`);
            resolve();
          };
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      if (isMounted) setIsLoading(false);
    };

    loadImages();
    return () => { isMounted = false; };
  }, []);

  // --- Rendering Logic ---
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const clampedIndex = Math.floor(Math.max(0, Math.min(index, FRAME_COUNT - 1)));
    const image = imageCache.current.get(clampedIndex);

    if (!canvas || !ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  // Sync with scroll
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    if (!isLoading) {
      requestAnimationFrame(() => renderFrame(latest));
    }
  });

  // Initial draw when loading finishes
  useEffect(() => {
    if (!isLoading) {
      renderFrame(0);
    }
  }, [isLoading]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white/50 font-mono text-xs tracking-widest">
          <div className="mb-4">ASSEMBLING RELIC...</div>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 transition-all duration-300 ease-out"
              style={{ width: `${(imagesLoaded / FRAME_COUNT) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] opacity-50">
            {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
          </div>
        </div>
      )}

      {/* The Canvas — sized to fill, drawn at correct aspect */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`
          block transition-opacity duration-700 ease-in-out
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          width: `${canvasSize.width / (window.devicePixelRatio || 1)}px`,
          height: `${canvasSize.height / (window.devicePixelRatio || 1)}px`,
        }}
      />

      {/* Cinematic Overlays (Fog/Grain) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+")',
        }}
      />
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-[#050505] via-transparent to-transparent opacity-40" />
    </div>
  );
}
