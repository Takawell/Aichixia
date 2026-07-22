"use client"

import createGlobe from "cobe"
import { useEffect, useRef, useState } from "react"

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [14.5995, 120.9842], size: 0.03 },
  { location: [19.076, 72.8777], size: 0.1 },
  { location: [23.8103, 90.4125], size: 0.05 },
  { location: [30.0444, 31.2357], size: 0.07 },
  { location: [39.9042, 116.4074], size: 0.08 },
  { location: [-23.5505, -46.6333], size: 0.1 },
  { location: [19.4326, -99.1332], size: 0.1 },
  { location: [40.7128, -74.006], size: 0.1 },
  { location: [34.6937, 135.5022], size: 0.05 },
  { location: [41.0082, 28.9784], size: 0.06 },
  { location: [51.5074, -0.1278], size: 0.08 },
  { location: [1.3521, 103.8198], size: 0.07 },
  { location: [-6.2088, 106.8456], size: 0.09 },
]

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const rRef = useRef(0)
  const [ready, setReady] = useState(false)

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      rRef.current = delta / 200
    }
  }

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return

    let frameId: number

    const onResize = () => {
      if (wrapperRef.current) {
        widthRef.current = wrapperRef.current.offsetWidth
      }
    }

    onResize()
    window.addEventListener("resize", onResize)

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.6,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.15, 0.25, 0.45],
      markerColor: [56 / 255, 189 / 255, 248 / 255],
      glowColor: [0.3, 0.5, 0.9],
      markers: MARKERS,
    })

    const animate = () => {
      if (pointerInteracting.current === null) {
        phiRef.current += 0.0035
      }
      globe.update({
        phi: phiRef.current + rRef.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      })
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    setReady(true)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", onResize)
      globe.destroy()
    }
  }, [])

  return (
    <div ref={wrapperRef} className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-full transition-opacity duration-700 [contain:layout_paint_size]"
        style={{ opacity: ready ? 1 : 0 }}
        onPointerDown={(e) =>
          updatePointerInteraction(e.clientX - pointerInteractionMovement.current)
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  )
}
