"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SmoothReveal } from "@/components/animations"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setEmail("")
    }, 1000)
  }

  const handleHowItWorksClick = (e) => {
    e.preventDefault()
    if (pathname === "/") {
      // If on homepage, scroll to section
      const element = document.getElementById("how-it-works")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } else {
      // If on another page, navigate to homepage with hash
      router.push("/#how-it-works")
    }
  }

  const productLinks = [
    { name: "How it Works", href: "/#how-it-works", onClick: handleHowItWorksClick },
    { name: "Browse Experts", href: "/marketplace" },
    { name: "Become an Expert", href: "/become-an-expert" },
  ]

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const socialLinks = [
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  ]

  return (
    <footer className="relative bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-8">    
          <SmoothReveal delay={0} duration={0.6}>
            <div className="space-y-6 lg:space-y-8">
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                Don't miss the good stuff.
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm -mt-4">
                We share lessons from the best conversations on Hubble. Quick reads. No spam. Just real insight.
              </p>
              
              <form onSubmit={handleSubmit} className="relative max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pr-28 rounded-lg border border-gray-700 bg-black/50 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                  required
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-transparent border border-gray-700 hover:bg-white hover:text-black hover:border-white text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                  style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                >
                  {isSubmitting ? "Joining..." : "Join us"}
                </motion.button>
              </form>
            </div>
          </SmoothReveal>

          <SmoothReveal delay={0.2} duration={0.6}>
            <div className="grid grid-cols-3 gap-8 lg:gap-12 lg:justify-end">
              <div>
                <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-wider text-gray-300">
                  Product
                </h3>
                <ul className="space-y-3.5">
                  {productLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={link.onClick}
                        className="text-gray-400 hover:text-white transition-all duration-200 text-sm group inline-block"
                      >
                        <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-wider text-gray-300">
                  Company
                </h3>
                <ul className="space-y-3.5">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-all duration-200 text-sm group inline-block"
                      >
                        <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-wider text-gray-300">
                  Social
                </h3>
                <ul className="space-y-3.5">
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center gap-2 group"
                        >
                          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </SmoothReveal>
        </div>

        <div className="pt-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <motion.div 
                className="flex items-center relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
              </motion.div>
              <span className="text-gray-400 text-sm group-hover:text-white transition-colors duration-200">
                © 2025 My First Cheque
              </span>
            </div>

            <div className="flex items-center gap-8">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-all duration-200 text-sm group"
              >
                <span className="group-hover:underline">Terms of Service</span>
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-all duration-200 text-sm group"
              >
                <span className="group-hover:underline">Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

