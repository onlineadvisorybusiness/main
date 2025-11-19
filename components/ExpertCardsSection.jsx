"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Crown, BadgeCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { SmoothReveal, SmoothSlide } from "@/components/animations"

export function ExpertCardsSection() {
  const router = useRouter()
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
      setTimeout(checkScrollability, 300)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
      setTimeout(checkScrollability, 300)
    }
  }

  const experts = [
    {
      id: 1,
      name: "Katie Dunn",
      username: "katie-dunn",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "Angel Investor In 25+ Startups across CPG, Tech, Web3, and AI"
    },
    {
      id: 2,
      name: "Ben Lang",
      username: "ben-lang",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "Head of Community at Cursor | Angel Investor"
    },
    {
      id: 3,
      name: "Justin Gerrard",
      username: "justin-gerrard",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "3X Startup Exits | Alum: Discord, Twitch, Meta"
    },
    {
      id: 4,
      name: "Terri Yo",
      username: "terri-yo",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "Marketing Leader | Growth Expert"
    },
    {
      id: 5,
      name: "Sarah Chen",
      username: "sarah-chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "Product Strategy | Former PM at Google"
    },
    {
      id: 6,
      name: "David Park",
      username: "david-park",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      rating: 5.0,
      topAdvisor: true,
      verified: true,
      description: "Engineering Leader | Tech Advisor"
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollability()
    }, 100)
    
    const handleResize = () => {
      setTimeout(checkScrollability, 100)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className="relative bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="mb-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <SmoothReveal delay={0} duration={0.6}>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2 leading-[1.1]"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                Experts who've <span className="bg-amber-700 text-transparent bg-clip-text">shared their experience.</span> 
              </h2>
            </SmoothReveal>
            <SmoothReveal delay={0.2} duration={0.6}>
              <p
                className="text-base md:text-base text-gray-600 leading-relaxed max-w-lg"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                They've built, scaled, failed, pivoted, and launched again. Now they're here to help you do the same—with clear, honest advice from lived experience.
              </p>
            </SmoothReveal>
          </div>
          <SmoothReveal delay={0.3} duration={0.6}>
            <div className="flex justify-end">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-black hover:text-black/80 transition-colors duration-200 group"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                <span className="text-lg ">Find your expert</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </SmoothReveal>
        </div>

        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide pb-4"
            onScroll={checkScrollability}
          >
            <div className="flex gap-6 min-w-max">
            {experts.map((expert, index) => (
              <SmoothSlide
                key={expert.id}
                direction="right"
                delay={index * 0.1}
                className="flex-shrink-0 group"
              >
                <div className="relative w-72 sm:w-80 h-[450px] sm:h-[500px] rounded-2xl overflow-hidden cursor-pointer">
                  <Image
                    src={expert.avatar}
                    alt={expert.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 320px) 100vw, 320px"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <div className="bg-yellow-400 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                      <span className="text-yellow-900 text-sm font-semibold">{expert.rating.toFixed(1)}</span>
                    </div>

                    {expert.topAdvisor && (
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">Top Advisor</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 transition-transform duration-300 ease-out md:group-hover:-translate-y-16">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 
                        className="text-white text-xl sm:text-2xl font-bold"
                        style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                      >
                        {expert.name}
                      </h3>
                      {expert.verified && (
                        <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-1 fill-blue-600 stroke-white" />
                      )}
                    </div>
                    <p 
                      className="text-white/90 text-sm leading-relaxed line-clamp-2 md:line-clamp-1 md:group-hover:line-clamp-none mb-3 md:mb-0"
                      style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                    >
                      {expert.description}
                    </p>
                    
                    <div className="md:hidden mt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/marketplace/${expert.username}`)
                        }}
                        className="bg-white text-black hover:text-white border border-white hover:border-white hover:bg-black px-3 py-2.5 rounded-lg font-semibold text-xs hover:bg-black transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-lg w-full cursor-pointer"
                        style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                      >
                        Book a call
                      </button>
                    </div>
                  </div>
                        
                  <div className="hidden md:block absolute bottom-0 left-0 right-0 p-6 z-20 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/marketplace/${expert.username}`)
                      }}
                      className="bg-white text-black hover:text-white border border-white hover:border-white hover:bg-black px-4 py-3 rounded-lg font-semibold text-sm hover:bg-black transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer w-full"
                      style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                    >
                      Book a call
                    </button>
                  </div>
                </div>
              </SmoothSlide>
            ))}
            </div>
          </div>

          <div className="flex items-right justify-end gap-2 mt-4">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll experts left"
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollLeft 
                  ? 'bg-black/10 hover:bg-black/20 text-black cursor-pointer' 
                  : 'bg-black/5 text-black/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll experts right"
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollRight 
                  ? 'bg-black/10 hover:bg-black/20 text-black cursor-pointer' 
                  : 'bg-black/5 text-black/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
