'use client'

import { Button } from '@/components/ui/button'
import { SignUp } from '@clerk/nextjs'
import NextImage from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SmoothReveal } from '@/components/animations'

export default function SignUpPage() {
  const router = useRouter()
  
  const handleBack = () => {
    // Try to go back, with fallback to homepage
    if (typeof window !== 'undefined' && document.referrer && document.referrer !== window.location.href) {
      router.back()
    } else {
      router.push('/')
    }
  }
  
  return (
    <div className="h-screen flex relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          onClick={handleBack}
          className="absolute top-6 left-6 z-10 flex items-center space-x-2 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-200 px-4 py-2.5 rounded-lg shadow-lg border border-gray-200/50 hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
          <span className="text-gray-700 font-medium text-sm" style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}>
            Back
          </span>
        </Button>
      </motion.div>

      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
        <NextImage 
          src="/pexels-george-milton-6953849.jpg" 
          alt="Startup Founder" 
          fill 
          className="object-cover w-full h-full" 
          priority
          quality={100}
        />
      </motion.div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white p-8 lg:p-12">
        <div className="w-full max-w-md">
          <SmoothReveal delay={0.2} duration={0.6} once={false}>
            <div className="mb-8 lg:mb-10">
              <h1 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 leading-tight"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                Sign Up
              </h1>
              <p 
                className="text-gray-600 text-base leading-relaxed"
                style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
              >
                Enter your details to join the community
              </p>
            </div>
          </SmoothReveal>
          
          <SmoothReveal delay={0.3} duration={0.6} once={false}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-0 lg:shadow-none lg:border-0">
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-black hover:bg-gray-900 text-white text-sm normal-case transition-all duration-200 shadow-md hover:shadow-lg',
                    card: 'shadow-none border-0 bg-transparent',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow',
                    formFieldInput: 'border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 rounded-lg',
                    footerActionLink: 'text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium',
                    formFieldLabel: 'text-gray-700 font-medium',
                    identityPreviewText: 'text-gray-900',
                    identityPreviewEditButton: 'text-gray-900 hover:text-gray-700 transition-colors',
                    formButtonReset: 'text-gray-600 hover:text-gray-900 transition-colors',
                    footerAction: 'text-gray-600',
                    footerActionLink__signIn: 'text-gray-900 hover:text-gray-700 font-medium'
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    showOptionalFields: false
                  }
                }}
                redirectUrl="/marketplace"
                signInUrl="/auth/sign-in"
              />
            </div>
          </SmoothReveal>
        </div>
      </div>
    </div>
  )
}
