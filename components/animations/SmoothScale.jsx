"use client"

import { motion } from "framer-motion"

export function SmoothScale({ 
  children, 
  delay = 0,
  duration = 0.5,
  scaleFrom = 0.8,
  className = "",
  once = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: scaleFrom }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

