"use client"

import { useUser } from "@clerk/nextjs"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import { Rocket } from "lucide-react"

export function HeroSection() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 40])
  const [email, setEmail] = useState("")
  const [userStatus, setUserStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/users/sync')
          if (response.ok) {
            const data = await response.json()
            setUserStatus(data.user?.accountStatus || 'learner')
          }
        } catch (error) {
          setUserStatus('learner')
        } finally {
          setIsLoading(false)
        }
      } else if (isLoaded && !user) {
        setIsLoading(false)
      }
    }

    fetchUserStatus()
  }, [isLoaded, user])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email address")
      return
    }

    if (!isLoading && user) {
      // User is signed in
      if (userStatus === 'expert') {
        router.push('/marketplace')
      } else {
        router.push('/become-an-expert')
      }
    } else {
      // User is not signed in
      router.push('/auth/sign-in')
    }
  }

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-green-950">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-green-950" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white bg-blue-400/10 border-2 animate-border"
            >
              <Rocket className="w-4 h-4" />
              <span>Your Growth Partner</span>
              
            </motion.div>

             <motion.h1
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.3 }}
               className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight text-white italic animate-text-glow"
               style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
             >
               Turn confusion into clarity with expert guidance
             </motion.h1>

             <motion.p
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto"
             >
               Get one-on-one guidance from experts who’ve built and scaled businesses. Learn what works and move forward with clarity.
             </motion.p>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center max-w-2xl mx-auto mt-8"
            >
              <form onSubmit={handleSubmit} className="relative flex w-full items-center">
                <Input
                  type="email"
                  placeholder="Enter your company email"
                  className="flex-1 h-14 text-base pr-24 bg-white text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="absolute right-1 h-12 px-6 bg-green-950 hover:bg-green-900 text-white border-2 rounded-xl animate-border">
                  Let's Go
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
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

