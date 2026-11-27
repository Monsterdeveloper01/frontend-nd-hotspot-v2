import { useState, useEffect } from 'react'

/**
 * High-performance, lightweight parallax hook using requestAnimationFrame and passive scroll listener.
 * - 0 KB external library
 * - 100% mobile-friendly
 * - Disables automatically if user has 'prefers-reduced-motion' enabled
 */
export function useParallax() {
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Respect user's accessibility setting for reduced motion
    const prefersReduced = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.pageYOffset || document.documentElement.scrollTop || 0)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return { scrollY, isMobile }
}
