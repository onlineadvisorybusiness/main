"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { Mouse } from "lucide-react"
import { SmoothReveal, SmoothFade } from "@/components/animations"

export function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 40])
  const [videoError, setVideoError] = useState(false)


  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden mb-10"> 
      <div className="absolute inset-0 z-0">
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoError(false)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/3191887-uhd_3840_2160_25fps.mp4" type="video/mp4" />
          </video>
        )}
        <div className={`absolute inset-0 bg-gradient-to-br from-green-950 via-green-900 to-green-800 ${videoError ? '' : 'hidden'}`} />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-end pb-20 pt-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <SmoothReveal 
            delay={0}
            duration={0.8}
            className="max-w-3xl space-y-6 lg:space-y-8"
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
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif", fontStyle: 'italic' }}
              >
                One conversation
                <br />
                can change everything.
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
                className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                My First Cheque connects you with experienced operators for real, 1:1 advice. Fast, honest, and human.
              </p>
            </SmoothReveal>
          </SmoothReveal>
        </div>

        <SmoothFade delay={0.6} duration={0.8} once={false}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="absolute bottom-8 right-8 bg-white/40 hover:bg-white text-gray-900 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center gap-2 z-20"
            style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
          >
            <span>Scroll</span>
            <Mouse className="w-4 h-4 " />
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
        
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:hidden {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}


