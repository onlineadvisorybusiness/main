"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, Users, DollarSign, HandCoins, TrendingUp, Handshake, ChevronLeft, ChevronRight, Briefcase, Target } from "lucide-react"
import { useRef, useState, useEffect } from "react"

export function CategoryCardsSection() {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const categories = [
    {
      id: 1,
      name: "Mental Health",
      icon: Heart,
      bgGradient: "from-pink-50 via-rose-50 to-pink-100",
      hoverColor: "from-pink-300 to-pink-200"
    },
    {
      id: 2,
      name: "Hiring & Team Building",
      icon: Users,
      bgGradient: "from-blue-50 via-cyan-50 to-blue-100",
      hoverColor: "from-blue-300 to-blue-200"
    },
    {
      id: 3,
      name: "Business & Money",
      icon: DollarSign,
      bgGradient: "from-emerald-50 via-green-50 to-emerald-100",
      hoverColor: "from-emerald-300 to-emerald-200"
    },
    {
      id: 4,
      name: "Fundraising 101",
      icon: HandCoins,
      bgGradient: "from-amber-50 via-yellow-50 to-amber-100",
      hoverColor: "from-amber-300 to-amber-200"
    },
    {
      id: 5,
      name: "Scaling the Business",
      icon: TrendingUp,
      bgGradient: "from-violet-50 via-purple-50 to-violet-100",
      hoverColor: "from-violet-300 to-violet-200"
    },
    {
      id: 6,
      name: "Sales & Growth",
      icon: Handshake,
      bgGradient: "from-cyan-50 via-sky-50 to-cyan-100",
      hoverColor: "from-cyan-300 to-cyan-200"
    },
    {
      id: 7,
      name: "Product Strategy",
      icon: TrendingUp,
      bgGradient: "from-indigo-50 via-blue-50 to-indigo-100",
      hoverColor: "from-indigo-300 to-indigo-200"
    },
    {
      id: 8,
      name: "Marketing",
      icon: Heart,
      bgGradient: "from-rose-50 via-pink-50 to-rose-100",
      hoverColor: "from-rose-300 to-rose-200"
    },
    {
      id: 9,
      name: "Business Strategy",
      icon: TrendingUp,
      bgGradient: "from-indigo-50 via-blue-50 to-indigo-100",
      hoverColor: "from-indigo-300 to-indigo-200"
    },
    {
      id: 10,
      name: "Business Strategy",
      icon: Briefcase,
      bgGradient: "from-cyan-50 via-sky-50 to-cyan-100",
      hoverColor: "from-cyan-300 to-cyan-200"
    },
    {
      id: 11,
      name: "Career Development",
      icon: Target,
      bgGradient: "from-indigo-50 via-blue-50 to-indigo-100",
      hoverColor: "from-indigo-300 to-indigo-200"
    }
  ]

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
    <section className="relative bg-white py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="mb-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2 leading-[1.1]"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Not sure <span className="bg-amber-700 text-transparent bg-clip-text">where</span> to start?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}   
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-base text-gray-600 leading-relaxed max-w-lg"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Explore real challenges others are solving.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-end"
          >
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-black hover:text-black/80 transition-colors duration-200 group"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              <span className="text-lg">View all experts</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>
    
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide pb-4"
            onScroll={checkScrollability}
          >
            <div className="flex gap-4 min-w-max">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <div 
                      className={`relative w-48 h-40 rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br ${category.bgGradient} border border-gray-200 group`}
                      onMouseEnter={(e) => {
                        const gradientDiv = e.currentTarget.querySelector('.gradient-overlay')
                        if (gradientDiv) {
                          gradientDiv.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const gradientDiv = e.currentTarget.querySelector('.gradient-overlay')
                        if (gradientDiv) {
                          gradientDiv.style.clipPath = 'polygon(0 0, 0% 0, 0% 0%, 0 0%)'
                        }
                      }}
                    >
                      <div
                        className={`gradient-overlay absolute inset-0 bg-gradient-to-br ${category.hoverColor} z-0`}
                        style={{
                          clipPath: 'polygon(0 0, 0% 0, 0% 0%, 0 0%)',
                          transition: 'clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                        <Icon className="w-8 h-8 text-gray-800 mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <h3 
                          className="text-gray-800 text-sm font-semibold text-center"
                          style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                        >
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollLeft 
                  ? 'bg-black/10 hover:bg-black/20 text-black cursor-pointer' 
                  : 'bg-black/5 text-black/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollRight 
                  ? 'bg-black/10 hover:bg-black/20 text-black cursor-pointer' 
                  : 'bg-black/5 text-black/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
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

