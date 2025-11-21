"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, Minus, X } from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "What types of advisors and consultants are available?",
    answer: "We have experienced business advisors, strategic consultants, financial advisors, startup mentors, growth consultants, and specialists across various industries. All provide personalized 1:1 mentorship sessions tailored to your specific needs."
  },
  {
    id: 2,
    question: "How does 1:1 mentorship work?",
    answer: "Each advisor and consultant offers personalized 1:1 mentorship sessions. You can review their profiles, see their expertise areas, read client reviews, and book sessions directly. Each session is tailored to address your specific challenges and goals."
  },
  {
    id: 3,
    question: "What's the difference between an advisor and a consultant?",
    answer: "Advisors typically provide ongoing strategic guidance and mentorship, while consultants offer specialized expertise for specific projects or challenges. Both provide 1:1 sessions, but advisors often work in longer-term relationships, while consultants focus on targeted solutions."
  },
  {
    id: 4,
    question: "Do I need a subscription for mentorship sessions?",
    answer: "No subscription required. You pay per 1:1 mentorship session, giving you flexibility to work with different advisors and consultants as your needs evolve. Some advisors also offer ongoing advisory plans for continuous support."
  },
  {
    id: 5,
    question: "Can I work with multiple advisors or consultants?",
    answer: "Absolutely! Many clients work with different advisors and consultants for different areas—for example, a business strategy advisor, a financial consultant, and a marketing advisor. Each 1:1 mentorship session is independent."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)
  const sectionRef = useRef(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-white py-12 sm:py-16 md:py-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-black leading-[1.2] mb-4"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              <span className="relative inline-block">
                Frequently asked.
              </span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="absolute left-0 top-0 w-full h-full bg-green-200" style={{ zIndex: 1 }} />
                <span className="relative z-10">Honestly answered.</span>
              </span>
            </motion.h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:bg-gray-200 border border-gray-200"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <h3
                    className="text-sm sm:text-base md:text-lg font-medium text-black flex-1"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    {openIndex === index ? (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    )}
                  </motion.div>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p
                    className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mt-3 sm:mt-4"
                    style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
                  >
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

