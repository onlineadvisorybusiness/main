"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"

const defaultVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // Smooth easing
    }
  }
}

export function SmoothReveal({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "",
  variants = defaultVariants,
  once = true 
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={variants}
      className={className}
      style={{
        transition: `opacity ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1), transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`
      }}
    >
      {children}
    </motion.div>
  )
}

export function SmoothRevealScroll({ 
  children, 
  className = "",
  offset = ["start end", "end start"]
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.3, 1, 1])
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [50, 30, 0, 0])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

