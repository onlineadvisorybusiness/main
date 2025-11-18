"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const experts = [
  {
    id: 1,
    quote: "The real edge of billion-dollar founders isn't who they are, but who they surround themselves with. Their true superpower is trusted advisors and peers.",
    author: "Chris Tottman",
    role: "Partner at Notion Capital",
    avatar: "/startup-founder.jpg",
    logo: "/Notion-logo.png",
    bgColor: "bg-yellow-100", // Light yellow
  },
  {
    id: 2,
    quote: "Success in business comes from making the right decisions at the right time. Having experienced mentors guide you through those critical moments is invaluable.",
    author: "Sarah Johnson",
    role: "CEO at TechVentures",
    avatar: "/startup-mentor.jpg",
    logo: "/google-icon.png",
    bgColor: "bg-blue-100", // Light blue
  },
  {
    id: 3,
    quote: "The best investment you can make is in yourself and your network. Surround yourself with people who challenge and elevate your thinking.",
    author: "Michael Chen",
    role: "Founder at Innovation Labs",
    avatar: "/startup-founder.jpg",
    logo: "/Linkedin.png",
    bgColor: "bg-green-100", // Light green
  },
]

export function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextExpert = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % experts.length)
  }, [])

  const selectExpert = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 15000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextExpert()
    }, 10000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextExpert])

  const currentExpert = experts[currentIndex]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gray-100">
      <div className="w-full max-w-7xl mx-auto">
       
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`${currentExpert.bgColor} rounded-3xl p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col justify-between transition-colors duration-[600ms]`}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base text-gray-900 mb-4"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Advice that changes everything.
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 flex items-center mb-8"
            >
              <h2
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-900 leading-tight"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                "{currentExpert.quote}"
              </h2>
            </motion.div>

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col gap-3"
              >
                <div className="flex gap-1">
                  {experts.map((expert, index) => (
                    <button
                      key={expert.id}
                      onClick={() => selectExpert(index)}
                      className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                        index === currentIndex
                          ? "border-gray-900 scale-110 ring-2 ring-gray-400"
                          : "border-gray-300 hover:border-gray-500 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={expert.avatar}
                        alt={expert.author}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 32px, 40px"
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <p 
                    className="font-semibold text-gray-900 text-base md:text-lg"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {currentExpert.author}
                  </p>
                  <p 
                    className="text-gray-700 text-sm md:text-base"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {currentExpert.role}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg p-2 flex items-center justify-center"
              >
                <Image
                  src={currentExpert.logo}
                  alt={`${currentExpert.author} company logo`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 56px, 72px"
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

