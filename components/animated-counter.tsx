"use client"

import { useEffect, useState } from "react"

interface AnimatedCounterProps {
  target: number
  duration?: number
  start?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  includePlusIcon?: boolean
}

export function AnimatedCounter({
  target,
  duration = 2000,
  start = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  includePlusIcon = true
}: AnimatedCounterProps) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation (ease-out)
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      const currentCount = start + (target - start) * easedProgress
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, start])

  const formattedCount = count.toFixed(decimals)

  return (
    <span className={className}>
      {prefix}
      {formattedCount}{includePlusIcon ? '+' : ""}
      {suffix}
    </span>
  )
}
