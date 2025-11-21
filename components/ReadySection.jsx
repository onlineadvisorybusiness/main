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
      video.muted = true
      video.loop = true
      video.playsInline = true
        
        const tryPlay = () => {
          const playPromise = video.play()
          if (playPromise !== undefined) {
          playPromise
            .then(() => {
            })
            .catch((error) => {   
            })
        }
      }

      video.addEventListener('canplay', tryPlay)
      video.addEventListener('loadeddata', tryPlay)
      
      tryPlay()

      return () => {
        video.removeEventListener('canplay', tryPlay)
        video.removeEventListener('loadeddata', tryPlay)
      }
    }
  }, [])

  return (
    <section className="relative bg-gray-100 py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] w-full bg-white">
          <div className="absolute inset-0 z-0">
            {!videoError ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
                onLoadedData={() => {
                  const video = videoRef.current
                  if (video) {
                    video.play().catch((error) => {
                    })
                  }
                }}
                onCanPlay={() => {
                  const video = videoRef.current
                  if (video) {
                    video.play().catch((error) => {
                    })
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
                aria-label="Background video showing advisory services"
              >
                <source src="/7413727-hd_1920_1080_24fps.mp4" type="video/mp4" />
                <track kind="captions" srcLang="en" label="English captions" />
              </video>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
            )}
          </div>

          <div className="relative z-10 flex h-full min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] items-end pb-8 sm:pb-10 md:pb-12 lg:pb-16 pt-8 sm:pt-10 md:pt-12 lg:pt-16">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="flex flex-col md:flex-row items-end justify-start gap-6 sm:gap-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-start text-left gap-3 sm:gap-4 max-w-2xl"
                >
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    Find your advisor today.
                  </h2>
                  
                  <p
                    className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 leading-relaxed max-w-lg"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    Connect with experienced advisors and consultants for personalized 1:1 mentorship that drives real results.
                  </p>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onClick={() => window.location.href = '/marketplace'}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-black px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 cursor-pointer gap-2"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    <Rocket 
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" 
                    />
                    Browse advisors & consultants
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
