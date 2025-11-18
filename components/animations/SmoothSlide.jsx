"use client"

import { motion } from "framer-motion"

const slideVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export function SmoothSlide({ 
  children, 
  direction = "up",
  delay = 0,
  className = "",
  once = true 
}) {
  return (
    <motion.div
      custom={direction}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={slideVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

