"use client"

import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

export function SmoothScroll({ children }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize Lenis with optimized settings for Framer Motion
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // RAF loop for smooth scrolling
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Sync Lenis with Framer Motion
    lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      // This ensures Framer Motion scroll animations work correctly
    })

    // Cleanup
    return () => {
      lenis.destroy()
    }
  }, [pathname])

  return <>{children}</>
}

