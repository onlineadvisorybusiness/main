"use client"

import { useEffect } from 'react'
import { HeroSection } from '@/components/Herosection'
import { ExpertCardsSection } from '@/components/ExpertCardsSection'
import { CategoryCardsSection } from '@/components/CategoryCardsSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { QuoteCarousel } from '@/components/QuoteCarousel'
import { FAQSection } from '@/components/FAQSection'
import { ReadySection } from '@/components/ReadySection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#how-it-works') {
      setTimeout(() => {
        const element = document.getElementById('how-it-works')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [])

  return (
    <>
      <HeroSection />     
      <ExpertCardsSection />
      <CategoryCardsSection />
      <HowItWorksSection />
      <QuoteCarousel />
      <FAQSection />
      <ReadySection />
      <Footer />
    </>
  )
}