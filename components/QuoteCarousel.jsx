"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const experts = [
  {
    id: 1,
    quote: "The best business leaders don't go it alone. They work with trusted advisors and consultants who provide 1:1 mentorship to navigate complex challenges and accelerate growth.",
    author: "Chris Tottman",
    role: "Strategic Advisor at Notion Capital",
    avatar: "/startup-founder.jpg",
    logo: "/Notion-logo.png",
    bgColor: "bg-yellow-100", // Light yellow
  },
  {
    id: 2,
    quote: "1:1 mentorship with experienced consultants transforms how you approach problems. It's not just advice—it's personalized guidance that changes outcomes.",
    author: "Sarah Johnson",
    role: "Business Consultant & CEO at TechVentures",
    avatar: "/startup-mentor.jpg",
    logo: "/google-icon.png",
    bgColor: "bg-blue-100", // Light blue
  },
  {
    id: 3,
    quote: "Working with the right advisor through personalized mentorship sessions is the fastest path to breakthrough insights and strategic clarity.",
    author: "Michael Chen",
    role: "Advisory Consultant at Innovation Labs",
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
    <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 md:py-12 bg-gray-100">
      <div className="w-full max-w-7xl mx-auto">
       
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`${currentExpert.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[600px] flex flex-col justify-between transition-colors duration-[600ms]`}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-gray-900 mb-3 sm:mb-4"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Real mentorship from real advisors.
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 flex items-center mb-6 sm:mb-8"
            >
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-gray-900 leading-tight"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                "{currentExpert.quote}"
              </h2>
            </motion.div>

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6 mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col gap-2 sm:gap-3"
              >
                <div className="flex gap-1">
                  {experts.map((expert, index) => (
                    <button
                      key={expert.id}
                      onClick={() => selectExpert(index)}
                      aria-label={`View quote from ${expert.author}`}
                      aria-pressed={index === currentIndex}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                        index === currentIndex
                          ? "border-gray-900 scale-110 ring-2 ring-gray-400"
                          : "border-gray-300 hover:border-gray-500 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={expert.avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, 40px"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <p 
                    className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {currentExpert.author}
                  </p>
                  <p 
                    className="text-gray-700 text-xs sm:text-sm md:text-base"
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
                className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg p-1.5 sm:p-2 flex items-center justify-center"
              >
                <Image
                  src={currentExpert.logo}
                  alt={`${currentExpert.author} company logo`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, 72px"
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

