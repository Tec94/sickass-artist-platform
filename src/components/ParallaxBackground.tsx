import { useEffect, useRef, useState } from 'react'

interface Layer {
  depth: number
  elements: Array<{
    x: number
    y: number
    size: number
    color: string
    speed: number
    shape: 'circle' | 'rect' | 'line'
  }>
}

export const ParallaxBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationRef = useRef<number>()
  const scrollYRef = useRef(0)
  const layersRef = useRef<Layer[]>([])

  const generateLayer = (depth: number, elementCount: number, baseSize: number): Layer => {
    const colors = ['#00D9FF', '#FF006E', '#8B0FFF', '#39FF14']
    const shapes: Array<'circle' | 'rect' | 'line'> = ['circle', 'rect', 'line']

    const elements = Array.from({ length: elementCount }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      size: baseSize * (0.5 + Math.random()),
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.1 + Math.random() * 0.5,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))

    return { depth, elements }
  }

  const initializeLayers = () => {
    layersRef.current = [
      generateLayer(0.1, 20, 15),    // Far - slow
      generateLayer(0.3, 30, 20),    // Mid - moderate
      generateLayer(0.5, 25, 25),    // Near - faster
      generateLayer(0.7, 15, 30),    // Closest - fastest
    ]
  }

  const handleResize = () => {
    if (canvasRef.current) {
      const { innerWidth, innerHeight } = window
      canvasRef.current.width = innerWidth
      canvasRef.current.height = innerHeight
      setDimensions({ width: innerWidth, height: innerHeight })
    }
  }

  const handleScroll = () => {
    scrollYRef.current = window.scrollY
  }

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: Layer['elements'][0],
    offsetX: number,
    offsetY: number
  ) => {
    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.fillStyle = element.color
    ctx.strokeStyle = element.color
    ctx.lineWidth = 2

    const x = (element.x + offsetX) % (dimensions.width + 200) - 100
    const y = (element.y + offsetY) % (dimensions.height + 200) - 100

    switch (element.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(x, y, element.size, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'rect':
        ctx.fillRect(x - element.size / 2, y - element.size / 2, element.size, element.size)
        break
      case 'line':
        ctx.beginPath()
        ctx.moveTo(x - element.size, y)
        ctx.lineTo(x + element.size, y)
        ctx.stroke()
        break
    }

    ctx.restore()
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.strokeStyle = '#00D9FF'
    ctx.lineWidth = 1

    const gridSize = 100
    const offsetXMod = offsetX % gridSize
    const offsetYMod = offsetY % gridSize

    for (let x = -gridSize; x < dimensions.width + gridSize; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x + offsetXMod, 0)
      ctx.lineTo(x + offsetXMod, dimensions.height)
      ctx.stroke()
    }

    for (let y = -gridSize; y < dimensions.height + gridSize; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y + offsetYMod)
      ctx.lineTo(dimensions.width, y + offsetYMod)
      ctx.stroke()
    }

    ctx.restore()
  }

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Draw background
    ctx.fillStyle = '#0A0E27'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Draw grid pattern
    const gridOffset = scrollYRef.current * 0.2
    drawGrid(ctx, 0, gridOffset)

    // Draw layers
    layersRef.current.forEach((layer) => {
      const parallaxOffset = scrollYRef.current * layer.depth
      const timeOffset = timestamp * 0.0001

      layer.elements.forEach((element) => {
        const moveX = Math.sin(timeOffset * element.speed) * 50
        const moveY = parallaxOffset + Math.cos(timeOffset * element.speed) * 20
        drawElement(ctx, element, moveX, moveY)
      })
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    initializeLayers()
    handleResize()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
