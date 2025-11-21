"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Mouse } from "lucide-react"
import { SmoothReveal, SmoothFade } from "@/components/animations"

export function HeroSection() {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 40])
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set video properties for iOS compatibility
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')
    
    // Try to play the video
    const playVideo = async () => {
      try {
        await video.play()
      } catch (error) {
        const handleInteraction = async () => {
          try {
            await video.play()
            document.removeEventListener('touchstart', handleInteraction)
            document.removeEventListener('click', handleInteraction)
          } catch (e) {
            // Video still can't play
          }
        }
        document.addEventListener('touchstart', handleInteraction, { once: true })
        document.addEventListener('click', handleInteraction, { once: true })
      }
    }

    // Try to play when video can play
    const handleCanPlay = () => {
      playVideo()
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadeddata', handleCanPlay)
    
    if (video.readyState >= 3) {
      playVideo()
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadeddata', handleCanPlay)
    }
  }, [])


  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden mb-6 sm:mb-8 md:mb-10"> 
      <div className="absolute inset-0 z-0">
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoError(false)}
            className="absolute inset-0 w-full h-full object-cover video-hero"
            aria-label="Background video showing business advisory services"
            style={{ pointerEvents: 'none' }}
          >
            <source src="/3191887-uhd_3840_2160_25fps.mp4" type="video/mp4" />
            <track kind="captions" srcLang="en" label="English captions" />
          </video>
        )}
        <div className={`absolute inset-0 bg-gradient-to-br from-green-950 via-green-900 to-green-800 ${videoError ? '' : 'hidden'}`} />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-end pb-12 sm:pb-16 md:pb-20 pt-12 sm:pt-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <SmoothReveal 
            delay={0}
            duration={0.8}
            className="max-w-3xl space-y-2 sm:space-y-3 lg:space-y-4"
            variants={{
              hidden: { opacity: 0, x: -32 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1]
                }
              }
            }}
            once={false}
          >
            <SmoothReveal 
              delay={0.2}
              duration={0.8}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.1, 0.25, 1]
                  }
                }
              }}
              once={false}
            >
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] sm:leading-[1.1] tracking-tight text-white"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif", fontStyle: 'italic' }}
              >
                Connect with expert
                <br />
                advisors & consultants.
              </h1>
            </SmoothReveal>

            <SmoothReveal 
              delay={0.4}
              duration={0.8}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.1, 0.25, 1]
                  }
                }
              }}
              once={false}
            >
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                Get personalized 1:1 mentorship from industry-leading advisors and consultants. Real guidance, real results.
              </p>
            </SmoothReveal>
          </SmoothReveal>
        </div>

        <SmoothFade delay={0.6} duration={0.8} once={false}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            aria-label="Scroll down to see more content"
            className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-white/40 hover:bg-white text-gray-900 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 sm:gap-2 z-20"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            <span className="hidden sm:inline">Scroll</span>
            <Mouse className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </motion.button>
        </SmoothFade>
      </div>

      <style jsx global>{`
        @keyframes borderColor {
          0% {
            border-color: rgba(255, 255, 255, 0.3);
          }
          25% {
            border-color: rgba(255, 255, 255, 0.6);
          }
          50% {
            border-color: rgba(255, 255, 255, 1);
          }
          75% {
            border-color: rgba(255, 255, 255, 0.6);
          }
          100% {
            border-color: rgba(255, 255, 255, 0.3);
          }
        }
        
        .animate-border {
          animation: borderColor 3s ease-in-out infinite;
        }
        
        /* Hide video controls and play button on iOS */
        .video-hero::-webkit-media-controls {
          display: none !important;
        }
        
        .video-hero::-webkit-media-controls-enclosure {
          display: none !important;
        }
        
        .video-hero::-webkit-media-controls-panel {
          display: none !important;
        }
        
        .video-hero::-webkit-media-controls-play-button {
          display: none !important;
        }
        
        .video-hero::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
        
        .video-hero {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:hidden {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}


