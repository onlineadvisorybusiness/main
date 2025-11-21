"use client"

import { motion } from "framer-motion"
import { useRef, useState, useEffect, useMemo } from "react"
import { useScroll, useTransform } from "framer-motion"
import { Search, Phone, TrendingUp } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Find your advisor or consultant",
    description: "Browse experienced advisors and consultants who specialize in your area of need.",
    bgColor: "bg-orange-200",
    borderColor: "border-orange-300",
    icon: Search,
    number: "01"
  },
  {
    id: 2,
    title: "Book 1:1 mentorship session",
    description: "Schedule personalized 1:1 sessions with your chosen advisor or consultant for direct guidance.",
    bgColor: "bg-pink-200",
    borderColor: "border-pink-300",
    icon: Phone,
    number: "02"
  },
  {
    id: 3,
    title: "Get ongoing advisory support",
    description: "Build a lasting relationship with your advisor for continuous mentorship and strategic guidance.",
    bgColor: "bg-green-200",
    borderColor: "border-green-300",
    icon: TrendingUp,
    number: "03"
  }
]

export function HowItWorksSection() {
  const sectionRef = useRef(null)
  const spacingRef = useRef(280) // Default mobile spacing
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "end 0.1"]
  })

  // Responsive card height and gap based on screen size
  const totalSpacing = useMemo(() => {
    const height = windowWidth < 640 ? 250 : windowWidth < 1024 ? 280 : windowWidth < 1280 ? 300 : 350
    const gapValue = windowWidth < 640 ? 30 : windowWidth < 1024 ? 40 : 50
    return height + gapValue
  }, [windowWidth])

  // Update ref when spacing changes
  useEffect(() => {
    spacingRef.current = totalSpacing
  }, [totalSpacing])

  const card1Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  
  // Use function-based transform that reads current totalSpacing from ref
  const card2Y = useTransform(scrollYProgress, (latest) => {
    const spacing = spacingRef.current
    if (latest < 0.1) return 0
    if (latest < 0.15) return 0
    if (latest >= 0.4) return spacing
    // Interpolate between 0.15 and 0.4
    const progress = (latest - 0.15) / (0.4 - 0.15)
    return progress * spacing
  })
  
  const card3Y = useTransform(scrollYProgress, (latest) => {
    const spacing = spacingRef.current
    if (latest < 0.1) return 0
    if (latest < 0.15) return 0
    if (latest >= 0.4) return spacing * 2
    // Interpolate between 0.15 and 0.4
    const progress = (latest - 0.15) / (0.4 - 0.15)
    return progress * spacing * 2
  })

  const card1Opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
  const card2Opacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [0, 0, 1])
  const card3Opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [0, 0, 1])

  const card1TextOpacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [0, 0, 1])
  const card2TextOpacity = useTransform(scrollYProgress, [0, 0.1, 0.12, 0.2], [0, 0, 0, 1])
  const card3TextOpacity = useTransform(scrollYProgress, [0, 0.12, 0.15, 0.25], [0, 0, 0, 1])

  const card1Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 1, 1, 1])
  const card2Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 0.95, 1, 1])
  const card3Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 0.95, 0.95, 1])

  const icon1Scale = useTransform(scrollYProgress, [0, 0.08, 0.1, 0.2], [0, 0, 0, 1])
  const icon2Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.25], [0, 0, 0, 1])
  const icon3Scale = useTransform(scrollYProgress, [0, 0.12, 0.2, 0.3], [0, 0, 0, 1])

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-white py-12 sm:py-16 md:py-20 mb-6 sm:mb-8 md:mb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2
            className="text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            How it works
          </h2>
          <p
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            Personalized 1:1 mentorship
            <br />
            from expert advisors.
          </p>
        </motion.div>

        <div className="relative max-w-xl mx-auto mt-8 sm:mt-12 md:mt-16 min-h-[800px] sm:min-h-[700px] md:min-h-[900px] lg:min-h-[1000px] xl:min-h-[1200px]">
          {steps.map((step, index) => {
            const Icon = step.icon
            let yTransform, opacityTransform, textOpacity, scaleTransform, iconScale
            if (index === 0) {
              yTransform = card1Y
              opacityTransform = card1Opacity
              textOpacity = card1TextOpacity
              scaleTransform = card1Scale
              iconScale = icon1Scale
            } else if (index === 1) {
              yTransform = card2Y
              opacityTransform = card2Opacity
              textOpacity = card2TextOpacity
              scaleTransform = card2Scale
              iconScale = icon2Scale
            } else {
              yTransform = card3Y
              opacityTransform = card3Opacity
              textOpacity = card3TextOpacity
              scaleTransform = card3Scale
              iconScale = icon3Scale
            }

            return (
              <motion.div
                key={step.id}
                style={{
                  y: yTransform,
                  opacity: opacityTransform,
                  scale: scaleTransform,
                  zIndex: 3 - index
                }}
                className={`absolute left-0 right-0 ${step.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 border-2 ${step.borderColor} text-center min-h-[250px] sm:min-h-[280px] md:min-h-[300px] lg:min-h-[350px] flex flex-col justify-center shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                <motion.div
                  className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/10 flex items-center justify-center"
                  style={{ opacity: textOpacity }}
                >
                  <span
                    className="text-base sm:text-lg font-bold text-black"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {step.number}
                  </span>
                </motion.div>

                <motion.div
                  className="flex justify-center mb-4 sm:mb-6"
                  style={{ opacity: textOpacity }}
                >
                  <motion.div 
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-black/10 flex items-center justify-center"
                    style={{ scale: iconScale }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black mb-3 sm:mb-4"
                  style={{ 
                    fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif",
                    opacity: textOpacity
                  }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-sm sm:text-base md:text-lg text-black/70 leading-relaxed max-w-lg mx-auto px-2"
                  style={{ 
                    fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif",
                    opacity: textOpacity
                  }}
                >
                  {step.description}
                </motion.p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

