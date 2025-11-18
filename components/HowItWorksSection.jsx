"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"
import { Search, Phone, TrendingUp } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Search for your expert",
    description: "Filter by background, reviews, or experience that matches your challenge.",
    bgColor: "bg-orange-200",
    borderColor: "border-orange-300",
    icon: Search,
    number: "01"
  },
  {
    id: 2,
    title: "Book a 1:1 discovery call",
    description: "15-45 minute calls to get unstuck and move forward.",
    bgColor: "bg-pink-200",
    borderColor: "border-pink-300",
    icon: Phone,
    number: "02"
  },
  {
    id: 3,
    title: "Keep growing with the Advisor Plan",
    description: "Build a long-term relationship for ongoing support and clarity.",
    bgColor: "bg-green-200",
    borderColor: "border-green-300",
    icon: TrendingUp,
    number: "03"
  }
]

export function HowItWorksSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "end 0.1"]
  })

  const cardHeight = 350
  const gap = 50
  const totalSpacing = cardHeight + gap

  const card1Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  
  const card2Y = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0, 0, 0, totalSpacing, totalSpacing])
  
  const card3Y = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0, 0, 0, totalSpacing * 2, totalSpacing * 2])

  // Opacity - faster return on scroll up
  const card1Opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
  const card2Opacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [0, 0, 1])
  const card3Opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [0, 0, 1])

  // Text visibility - faster hide on scroll up
  const card1TextOpacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [0, 0, 1])
  const card2TextOpacity = useTransform(scrollYProgress, [0, 0.1, 0.12, 0.2], [0, 0, 0, 1])
  const card3TextOpacity = useTransform(scrollYProgress, [0, 0.12, 0.15, 0.25], [0, 0, 0, 1])

  // Scale animations - faster return on scroll up
  const card1Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 1, 1, 1])
  const card2Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 0.95, 1, 1])
  const card3Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.4, 1], [0.95, 0.95, 0.95, 0.95, 1])

  // Icon scale animations - faster return on scroll up
  const icon1Scale = useTransform(scrollYProgress, [0, 0.08, 0.1, 0.2], [0, 0, 0, 1])
  const icon2Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.25], [0, 0, 0, 1])
  const icon3Scale = useTransform(scrollYProgress, [0, 0.12, 0.2, 0.3], [0, 0, 0, 1])

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-white py-20 mb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl md:text-3xl text-black mb-4"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            How it works
          </h2>
          <p
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            Clarity starts with
            <br />
            real connection.
          </p>
        </motion.div>

        <div className="relative max-w-xl mx-auto mt-16 min-h-[1000px] md:min-h-[1200px]">
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
                className={`absolute left-0 right-0 ${step.bgColor} rounded-3xl p-10 md:p-12 lg:p-16 border-2 ${step.borderColor} text-center min-h-[300px] md:min-h-[350px] flex flex-col justify-center shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                <motion.div
                  className="absolute top-6 left-6 w-12 h-12 rounded-full bg-black/10 flex items-center justify-center"
                  style={{ opacity: textOpacity }}
                >
                  <span
                    className="text-lg font-bold text-black"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {step.number}
                  </span>
                </motion.div>

                <motion.div
                  className="flex justify-center mb-6"
                  style={{ opacity: textOpacity }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center"
                    style={{ scale: iconScale }}
                  >
                    <Icon className="w-8 h-8 text-black" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-2xl md:text-3xl lg:text-4xl text-black mb-4"
                  style={{ 
                    fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif",
                    opacity: textOpacity
                  }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-base md:text-lg text-black/70 leading-relaxed max-w-lg mx-auto"
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

