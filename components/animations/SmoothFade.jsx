"use client"

import { motion } from "framer-motion"

export function SmoothFade({ 
  children, 
  delay = 0, 
  duration = 0.8,
  className = "",
  once = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
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

