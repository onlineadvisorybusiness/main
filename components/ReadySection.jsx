"use client"

import { motion } from "framer-motion"
import { Rocket } from "lucide-react"
import { useRef, useState, useEffect } from "react"

export function ReadySection() {
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set video properties
      video.muted = true
      video.loop = true
      video.playsInline = true
      
      // Try to play when video is ready
      const tryPlay = () => {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video is playing
            })
            .catch((error) => {
              console.error("Video play failed:", error)
            })
        }
      }

      // Try playing when video can play
      video.addEventListener('canplay', tryPlay)
      video.addEventListener('loadeddata', tryPlay)
      
      // Also try immediately
      tryPlay()

      return () => {
        video.removeEventListener('canplay', tryPlay)
        video.removeEventListener('loadeddata', tryPlay)
      }
    }
  }, [])

  return (
    <section className="relative bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl overflow-hidden min-h-[700px] md:min-h-[800px] w-full bg-white">
          <div className="absolute inset-0 z-0">
            {!videoError ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
                onLoadedData={() => {
                  const video = videoRef.current
                  if (video) {
                    video.play().catch((error) => {
                      console.error("Video play failed:", error)
                    })
                  }
                }}
                onCanPlay={() => {
                  const video = videoRef.current
                  if (video) {
                    video.play().catch((error) => {
                      console.error("Video play failed:", error)
                    })
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
              >
                <source src="/7413727-hd_1920_1080_24fps.mp4" type="video/mp4" />
              </video>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
            )}
          </div>

          <div className="relative z-10 flex h-full min-h-[700px] md:min-h-[800px] items-end pb-12 md:pb-16 pt-12 md:pt-16">
            <div className="w-full px-8 md:px-12 lg:px-16">
              <div className="flex flex-col md:flex-row items-end justify-start gap-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-start text-left gap-4 max-w-2xl"
                >
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    Ready when you are.
                  </h2>
                  
                  <p
                    className="text-sm md:text-base lg:text-lg text-white/90 leading-relaxed max-w-lg"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    Search real experts who've solved what you're facing, and get honest advice that actually helps.
                  </p>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onClick={() => window.location.href = '/marketplace'}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-black px-6 py-3 rounded-lg text-base font-medium transition-colors duration-200 cursor-pointer gap-2"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    <Rocket 
                      className="w-4 h-4 text-black" 
                    />
                    Find your expert
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
