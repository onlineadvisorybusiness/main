"use client"

import { SmoothReveal } from "@/components/animations"
import { Footer } from "@/components/Footer"
import Image from "next/image"

const Paragraph = ({ children, className = "" }) => (
  <p className={`text-gray-700 leading-relaxed mb-4 ${className}`} style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}>
    {children}
  </p>
)

const SectionTitle = ({ children, level = 2 }) => {
  const Tag = `h${level}`
  const sizeClass = level === 2 ? "text-2xl md:text-3xl" : level === 3 ? "text-xl md:text-2xl" : "text-lg md:text-xl"
  return (
    <Tag
      className={`${sizeClass} font-semibold text-black mb-4 ${level === 2 ? 'mt-8' : 'mt-6'}`}
      style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
    >
      {children}
    </Tag>
  )
}

const ListItem = ({ children }) => (
  <li className="text-gray-700 leading-relaxed mb-2" style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}>
    {children}
  </li>
)

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-white pt-8">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-10 py-10 md:py-10 lg:py-10">

            <SmoothReveal delay={0.1} duration={0.6}>
                <div className="rounded-2xl overflow-hidden w-full border-2 border-gray-200 shadow-lg mb-12">
                    <div className="relative w-full aspect-video">
                        <Image 
                        src="/medium-shot-woman-working-laptop.jpg" 
                        alt="Privacy Policy" 
                        fill
                        quality={100}
                        className="object-fill"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                        priority
                        />
                    </div>
                </div>
            </SmoothReveal>

          <SmoothReveal delay={0} duration={0.6}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black mb-4"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-sm mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </SmoothReveal>

          <div className="space-y-12">
            <SmoothReveal delay={0.2} duration={0.6}>
              <section>
                <SectionTitle>1. Introduction</SectionTitle>
                <Paragraph>
                  This Privacy Policy describes how Circles App, Inc. (DBA myfirstcheque) ("we", "our", or "us") collects, uses, and shares your personal information when you use our platform (the "Platform") at www.myfirstcheque.com.
                </Paragraph>
                <Paragraph>
                  By using our Platform, you agree to the collection and use of information in accordance with this Privacy Policy.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.3} duration={0.6}>
              <section>
                <SectionTitle>2. Information We Collect</SectionTitle>
                <Paragraph>
                  We collect information that you provide directly to us, including when you create an account, book a consultation, or contact us for support.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.4} duration={0.6}>
              <section>
                <SectionTitle>3. How We Use Your Information</SectionTitle>
                <Paragraph>
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.5} duration={0.6}>
              <section>
                <SectionTitle>4. Contact Information</SectionTitle>
                <Paragraph>
                  If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@myfirstcheque.com" className="text-black hover:underline">info@myfirstcheque.com</a>.
                </Paragraph>
              </section>
            </SmoothReveal>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

