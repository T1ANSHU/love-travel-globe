/**
 * Adapted from Magic UI Particles (magicui.design/docs/components/particles)
 * Source: github.com/magicuidesign/magicui — MIT License
 *
 * Changes from original:
 * - Removed "use client" (Vite/React, not Next.js)
 * - Replaced @/lib/utils cn() with inline class join
 * - NodeJS.Timeout → ReturnType<typeof setTimeout>
 * - Added ParticlesBackground convenience wrapper with dreamy-pink defaults
 */

import React, {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from 'react'

// ── Helpers ────────────────────────────────────────────────────────────────

function useMousePosition(): { x: number; y: number } {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// ── Types ──────────────────────────────────────────────────────────────────

type Circle = {
  x: number; y: number
  translateX: number; translateY: number
  size: number
  alpha: number; targetAlpha: number
  dx: number; dy: number
  magnetism: number
}

interface ParticlesProps extends ComponentPropsWithoutRef<'div'> {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

// ── Core Particles component ───────────────────────────────────────────────

export const Particles: React.FC<ParticlesProps> = ({
  className = '',
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = '#ffffff',
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const mousePos = useMousePosition()
  const mouse = useRef({ x: 0, y: 0 })
  const canvasSize = useRef({ w: 0, h: 0 })
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  const rafID = useRef<number | null>(null)
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // stable refs so closures always call the latest version
  const initRef = useRef<() => void>(() => {})
  const onMoveRef = useRef<() => void>(() => {})
  const animRef = useRef<() => void>(() => {})

  // init + resize
  useEffect(() => {
    if (canvasRef.current) ctx.current = canvasRef.current.getContext('2d')
    initRef.current()
    animRef.current()

    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(() => initRef.current(), 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      if (rafID.current != null) cancelAnimationFrame(rafID.current)
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      window.removeEventListener('resize', onResize)
    }
  }, [color])

  // mouse move
  useEffect(() => { onMoveRef.current() }, [mousePos.x, mousePos.y])

  // refresh prop
  useEffect(() => { initRef.current() }, [refresh])

  // ── canvas helpers ────────────────────────────────────────────────────

  const resizeCanvas = () => {
    if (!containerRef.current || !canvasRef.current || !ctx.current) return
    canvasSize.current.w = containerRef.current.offsetWidth
    canvasSize.current.h = containerRef.current.offsetHeight
    canvasRef.current.width  = canvasSize.current.w * dpr
    canvasRef.current.height = canvasSize.current.h * dpr
    canvasRef.current.style.width  = `${canvasSize.current.w}px`
    canvasRef.current.style.height = `${canvasSize.current.h}px`
    ctx.current.scale(dpr, dpr)
    circles.current = []
    for (let i = 0; i < quantity; i++) {
      const c = circleParams()
      drawCircle(c)
    }
  }

  const circleParams = (): Circle => ({
    x: Math.floor(Math.random() * canvasSize.current.w),
    y: Math.floor(Math.random() * canvasSize.current.h),
    translateX: 0,
    translateY: 0,
    size: Math.floor(Math.random() * 2) + size,
    alpha: 0,
    targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    dx: (Math.random() - 0.5) * 0.1,
    dy: (Math.random() - 0.5) * 0.1,
    magnetism: 0.1 + Math.random() * 4,
  })

  const rgb = hexToRgb(color)

  const drawCircle = (c: Circle, update = false) => {
    if (!ctx.current) return
    ctx.current.translate(c.translateX, c.translateY)
    ctx.current.beginPath()
    ctx.current.arc(c.x, c.y, c.size, 0, 2 * Math.PI)
    ctx.current.fillStyle = `rgba(${rgb.join(', ')}, ${c.alpha})`
    ctx.current.fill()
    ctx.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!update) circles.current.push(c)
  }

  const clearCtx = () => {
    if (ctx.current)
      ctx.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
  }

  const remapValue = (v: number, s1: number, e1: number, s2: number, e2: number) => {
    const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2
    return r > 0 ? r : 0
  }

  // ── stable function bodies (assigned to refs each render) ─────────────

  const initCanvas = () => { resizeCanvas(); clearCtx(); for (let i = 0; i < quantity; i++) drawCircle(circleParams()) }

  const onMouseMove = () => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { w, h } = canvasSize.current
    const x = mousePos.x - rect.left - w / 2
    const y = mousePos.y - rect.top  - h / 2
    if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
      mouse.current.x = x
      mouse.current.y = y
    }
  }

  const animate = () => {
    clearCtx()
    circles.current.forEach((c, i) => {
      const edge = [
        c.x + c.translateX - c.size,
        canvasSize.current.w - c.x - c.translateX - c.size,
        c.y + c.translateY - c.size,
        canvasSize.current.h - c.y - c.translateY - c.size,
      ]
      const closest = edge.reduce((a, b) => Math.min(a, b))
      const fade = parseFloat(remapValue(closest, 0, 20, 0, 1).toFixed(2))
      c.alpha = fade > 1 ? Math.min(c.alpha + 0.02, c.targetAlpha) : c.targetAlpha * fade
      c.x += c.dx + vx
      c.y += c.dy + vy
      c.translateX += (mouse.current.x / (staticity / c.magnetism) - c.translateX) / ease
      c.translateY += (mouse.current.y / (staticity / c.magnetism) - c.translateY) / ease
      drawCircle(c, true)

      if (
        c.x < -c.size || c.x > canvasSize.current.w + c.size ||
        c.y < -c.size || c.y > canvasSize.current.h + c.size
      ) {
        circles.current.splice(i, 1)
        drawCircle(circleParams())
      }
    })
    rafID.current = requestAnimationFrame(animRef.current)
  }

  initRef.current  = initCanvas
  onMoveRef.current = onMouseMove
  animRef.current  = animate

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={['pointer-events-none', className].filter(Boolean).join(' ')}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

// ── ParticlesBackground — two-layer dreamy pink auth background ───────────
//
// Layer A (rose): larger, fewer — the visible romantic "stars"
// Layer B (white): smaller, more — the fine dreamy shimmer behind them
//
// To tune without touching core Particles logic, adjust the constants below:

const LAYER_A = {
  quantity:  80,          // rose-pink dots — main visible layer
  color:    '#f9a8d4',   // pink-300 (soft rose)
  size:      1.4,         // base radius px — actual range 1.4 – 3.4 px
  staticity: 70,
  ease:      85,
}

const LAYER_B = {
  quantity:  55,          // white shimmer — secondary layer
  color:    '#ffffff',
  size:      0.9,         // smaller than layer A
  staticity: 60,
  ease:      90,
}

export function ParticlesBackground() {
  return (
    <>
      <Particles
        className="fixed inset-0 z-0"
        quantity={LAYER_A.quantity}
        color={LAYER_A.color}
        size={LAYER_A.size}
        staticity={LAYER_A.staticity}
        ease={LAYER_A.ease}
      />
      <Particles
        className="fixed inset-0 z-0"
        quantity={LAYER_B.quantity}
        color={LAYER_B.color}
        size={LAYER_B.size}
        staticity={LAYER_B.staticity}
        ease={LAYER_B.ease}
      />
    </>
  )
}
