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

export default function TermsOfServicePage() {
  return (
    <>
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-12 md:py-16 lg:py-20">

          <SmoothReveal delay={0.1} duration={0.6}>
            <div className="rounded-2xl overflow-hidden w-full border-2 border-gray-200 shadow-lg mb-12">
              <div className="relative w-full aspect-video">
                <Image 
                  src="/photorealistic-lifestyle-judge.jpg" 
                  alt="Terms of Service" 
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                  priority
                  loading="eager"
                />
              </div>
            </div>
          </SmoothReveal>

          <SmoothReveal delay={0} duration={0.6}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black mb-4"
              style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}
            >
              Terms of Service
            </h1>
            <p className="text-gray-600 text-sm mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </SmoothReveal>

          <div className="space-y-12">
            <SmoothReveal delay={0.1} duration={0.6}>
              <section>
                <SectionTitle>1. Introduction</SectionTitle>
                <Paragraph>
                  These Terms of Service (this "Agreement") constitute a legally binding contract between you ("User" or "you") and Circles App, Inc. ("Company" or "we"), a Delaware C Corporation operating under the registered Doing Business As (DBA) name myfirstcheque. This Agreement governs your use of the myfirstcheque platform (the "Platform" or "myfirstcheque"), including our website at www.myfirstcheque.com, mobile applications, and any related services provided by the Company.
                </Paragraph>
                <Paragraph>
                  These Terms outline the rules and guidelines for using our Platform, including what you are permitted to do and what actions are prohibited. By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any other policies referenced herein. In the event of any conflict or inconsistency between these Terms and any other legal document, including our Privacy Policy, these Terms shall govern.
                </Paragraph>
                <Paragraph>
                  If you do not agree to these Terms, you must not access or use the Platform.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.2} duration={0.6}>
              <section>
                <SectionTitle>1. Overview and Definitions</SectionTitle>
                <Paragraph>
                  Our Platform is an online knowledge-sharing platform that connects Experts with Learners, enabling them to engage in professional consultations and subscription-based services across a variety of fields. By leveraging third-party video conferencing tools such as Google Meets and Zoom, we facilitate seamless interactions while ensuring a smooth booking, payment, and scheduling experience. Experts can offer their expertise through one-time consultation calls or ongoing subscription services, while Learners can access valuable knowledge, guidance, and support tailored to their needs. We provide the technical infrastructure and secure payment processing to support these interactions, while Expert-led content and services remain the responsibility of the Experts themselves.
                </Paragraph>
                
                <SectionTitle level={3}>Key Definitions:</SectionTitle>
                <ul className="list-disc pl-6 space-y-3 mb-4">
                  <ListItem>
                    <strong>"Platform"</strong> refers to the myfirstcheque website (www.myfirstcheque.com), mobile applications, and all related services, features, and functionalities provided by Circles App, Inc. (DBA myfirstcheque).
                  </ListItem>
                  <ListItem>
                    <strong>"User"</strong> refers to any individual or entity that accesses or uses the Platform, including but not limited to Experts and Learners.
                  </ListItem>
                  <ListItem>
                    <strong>"Expert"</strong> refers to an individual who has registered on the Platform to offer professional consultation services to Learners through Consultation Calls, Subscription Plans, or other service offerings.
                  </ListItem>
                  <ListItem>
                    <strong>"Learner"</strong> refers to an individual or entity that seeks, requests, or receives consultation or subscription-based services from Experts through the Platform.
                  </ListItem>
                  <ListItem>
                    <strong>"Services"</strong> refers to the video consultations (also referred to as "Consultation Calls"), subscription-based offerings (also referred to as "Subscription Services" or "Subscription Plans"), and any other services provided by Experts to Learners via the Platform. All Services between Experts and Learners take place exclusively through Third-Party Platforms and not directly on the Platform. The Platform serves as a facilitator but does not host or conduct consultations on its own systems.
                  </ListItem>
                  <ListItem>
                    <strong>"Content"</strong> refers to all information, data, text, software, music, sound, photographs, graphics, videos, messages, or any other materials submitted, posted, shared, or displayed by Users on the Platform.
                  </ListItem>
                  <ListItem>
                    <strong>"Third-Party Platform"</strong> refers to external services, applications, and tools that we integrate with or rely on to provide and facilitate the Platform's functionality. This includes, but is not limited to, Google Services, Zoom, and other third-party providers used to organize and conduct the Services, process payments, and manage subscriptions offered by Experts. The Platform does not directly provide or host these Services but acts as an intermediary connecting Users to Third-Party Platforms.
                  </ListItem>
                </ul>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.3} duration={0.6}>
              <section>
                <SectionTitle>2. Eligibility and Account Creation</SectionTitle>
                
                <SectionTitle level={3}>2.1 Age and Capacity Requirements</SectionTitle>
                <Paragraph>
                  By creating an account on our Platform, you represent and warrant that you are at least 18 years of age and possess the legal capacity to enter into these Terms and to use the Platform in accordance with all applicable laws and regulations. If you are creating an account on behalf of a business entity, you represent and warrant that you have the authority to bind such entity to these Terms.
                </Paragraph>

                <SectionTitle level={3}>2.2 Account Registration and Security</SectionTitle>
                <Paragraph>
                  To access certain features of our Platform, you must register for an account. During the registration process, you agree to provide accurate, current, and complete information about yourself. You acknowledge that your failure to provide accurate information may result in the immediate termination of your account.
                </Paragraph>
                <Paragraph>
                  You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. Circles App, Inc. (DBA myfirstcheque) will not be liable for any losses caused by unauthorized use of your account.
                </Paragraph>

                <SectionTitle level={3}>2.3 Expert Verification and Credentials</SectionTitle>
                <Paragraph>
                  Experts must undergo our manual or automatic verification process before being permitted to offer Services through the Platform. This process includes, but is not limited to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Verification of credentials, licenses, and certifications relevant to the Expert's field of expertise;</ListItem>
                  <ListItem>Background checks where applicable;</ListItem>
                  <ListItem>Verification of identity and contact information;</ListItem>
                  <ListItem>Review of professional experience and qualifications.</ListItem>
                </ul>
                <Paragraph>
                  We reserve the right to modify our verification requirements at any time and to require additional verification from Experts as deemed necessary. While we make efforts to verify Expert credentials, we do not guarantee the accuracy, completeness, or reliability of any Expert's credentials, qualifications, or background.
                </Paragraph>
                <Paragraph>
                  By using our platform, users acknowledge that they engage with Experts at their own risk, and we disclaim any liability arising from an Expert's misrepresentation, misconduct, or illegal activity at any point in time.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.4} duration={0.6}>
              <section>
                <SectionTitle>3. Platform Services</SectionTitle>
                
                <SectionTitle level={3}>3.1 Scope of Services</SectionTitle>
                <Paragraph>
                  Circles App, Inc. (DBA myfirstcheque) provides a marketplace platform that facilitates Consultations Calls and subscription-based Services between Experts and Learners. Our role is strictly limited to providing the technical infrastructure and support necessary to enable these interactions. We do not provide professional services directly and are not responsible for the quality, safety, legality, or accuracy of the services offered by Experts through our Platform. The Platform enables Experts to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Create professional profiles, set their availability, and offer their expertise through scheduled Consultation Calls.</ListItem>
                  <ListItem>Offer Subscription Plans that may include any content, guidance, or information the Expert deems valuable, legally compliant, and beneficial to Learners on the Platform. This may include but is not limited to educational materials, mentorship, coaching, Q&A sessions, or other forms of professional insight. While we actively monitor Expert offerings to ensure compliance with our policies, Experts are solely responsible for determining the content and scope of their services.</ListItem>
                </ul>
                <Paragraph>
                  Learners can:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Browse Expert profiles, book consultation sessions, and subscribe to ongoing Services provided by Experts.</ListItem>
                </ul>
                <Paragraph>
                  Both Experts and Learners will have access to a personal dashboard, where they can view and manage their profiles, scheduled Consultation Calls, and active Subscription Plans. This dashboard provides a centralized space to track bookings, modify preferences, and access relevant session details.
                </Paragraph>
                <Paragraph>
                  All Consultations Calls and Subscription Plans are conducted exclusively via third-party platforms such as Google Meet and Zoom. We do not host or conduct these sessions directly and assume no liability for any issues arising during these interactions, including but not limited to technical failures, disputes, or any illegal activities.
                </Paragraph>

                <SectionTitle level={3}>3.2 User Registration and Access</SectionTitle>
                <Paragraph>
                  All Users can sign up on myfirstcheque by selecting either an email and password combination or by using Google Single Sign-On (SSO).
                </Paragraph>
                <Paragraph>
                  Upon booking a Service on the Platform, Users will be asked for permission to access their Google or Zoom accounts for the purposes of calendar integration, scheduling, and email communication. This allows us to send calendar invites, manage bookings efficiently, and ensure smooth scheduling between Experts and Learners.
                </Paragraph>

                <SectionTitle level={3}>3.3 Consultation Calls</SectionTitle>
                <Paragraph>
                  When a Consultation Call is Booked:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Both the Expert and the Learner are solely responsible for coordinating the specifics of the Consultation Call, including scheduling, preparation, and communication.</ListItem>
                  <ListItem>Our responsibility is limited to providing the platform for booking and facilitating the technical aspects of the call, such as payment processing and maintaining a record of the consultation. The actual Consultation Call is conducted via Third-Party Platforms, such as Google Meet or Zoom, and myfirstcheque does not host or conduct the call directly.</ListItem>
                  <ListItem>We cannot be held liable for any issues, including but not limited to technical difficulties, disputes, or legal matters arising during the Consultation Call. Any disputes or issues that arise during or after the Consultation Call must be resolved directly between the Expert and the Learner. If the parties are unable to resolve the matter independently, they may contact myfirstcheque support via email for assistance. However, myfirstcheque does not guarantee a resolution. In cases where myfirstcheque cannot assist, both parties must explore alternative legal methods for resolving the issue outside of myfirstcheque's legal jurisdiction.</ListItem>
                </ul>
                
                <Paragraph>
                  <strong>Refund Policy:</strong>
                </Paragraph>
                <Paragraph>
                  Learners may request a refund for a Consultation Call up to 3 days after the scheduled call date. Each refund claim will be manually reviewed by the myfirstcheque support team. If the claim is deemed valid—such as in cases where the call did not occur due to the Expert's fault (e.g., no-show)—the call fee will be refunded to the Learner and deducted from the Expert's account.
                </Paragraph>

                <Paragraph>
                  <strong>Rescheduling Policy:</strong>
                </Paragraph>
                <Paragraph>
                  Learners may reschedule a Consultation Call up to 2 hours before the scheduled time directly through their Dashboard. Experts may also request a reschedule up to 2 hours in advance by notifying the Learner and coordinating a new time. Rescheduling within 2 hours of the scheduled call is not permitted except in extenuating circumstances and is subject to the Learner's or Expert's discretion.
                </Paragraph>

                <SectionTitle level={3}>3.4 Subscription Services</SectionTitle>
                <Paragraph>
                  When a Subscription Service ("Advisor Plan") is booked:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Both the Expert and the Learner are exclusively responsible for coordinating the details of the Service, including but not limited to timelines, deliverables, and communication.</ListItem>
                  <ListItem>The Platform's role is limited to processing payments and maintaining a record of the subscription agreement. We do not mediate or oversee the ongoing management of the Subscription Plan.</ListItem>
                  <ListItem>The actual Subscription Plans are conducted via Third-Party Platforms, such as Google Meet or Zoom, and the Platform does not host or conduct the call directly.</ListItem>
                  <ListItem>We cannot be held liable for any issues, including but not limited to technical difficulties, disputes, or legal matters arising during any of the Subscription Services. Any disputes or issues that arise during or after the Subscription Service must be resolved directly between the Expert and the Learner. If the parties are unable to resolve the matter independently, they may contact myfirstcheque support via email for assistance. However, myfirstcheque does not guarantee a resolution. In cases where myfirstcheque cannot assist, both parties must explore alternative legal methods for resolving the issue outside of myfirstcheque's legal jurisdiction.</ListItem>
                </ul>

                <Paragraph>
                  <strong>Subscription Cancellation Policy:</strong>
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Learners may cancel their active subscription at any time through their Learner Dashboard under the "Advisor Plan" tab. The myfirstcheque team will manually process the cancellation request.</ListItem>
                  <ListItem>Experts who wish to cancel an ongoing subscription must contact myfirstcheque support via the contact form available in their Dashboard. The myfirstcheque team will manually process the cancellation request.</ListItem>
                  <ListItem>In both cases, the subscription will remain active until the end of the current paid billing period, after which it will not be renewed.</ListItem>
                </ul>

                <SectionTitle level={3}>3.5 Service Limitations</SectionTitle>
                <Paragraph>
                  While we strive to maintain high standards for our Platform, we do not guarantee, among other aspects:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>The availability of any specific Expert;</ListItem>
                  <ListItem>The quality or accuracy of advice provided by Experts;</ListItem>
                  <ListItem>The technical quality of Consultation Call or Subscription Service;</ListItem>
                  <ListItem>The outcome of any Consultation Call or Subscription Service engagement;</ListItem>
                  <ListItem>The continuous availability or uninterrupted operation of the Platform.</ListItem>
                </ul>

                <SectionTitle level={3}>3.6 Booking and Scheduling</SectionTitle>
                <Paragraph>
                  All Consultation Calls must be scheduled through our Platform's booking system. All Subscription Services are booked through the platform, but scheduling is the responsibility of both the Learner and the Expert. Both parties must coordinate and schedule sessions in good faith. When a Learner books a Consultation Call or Subscription Service with an Expert, both parties agree to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Attend scheduled sessions and adhere to agreed-upon subscription terms.</ListItem>
                  <ListItem>Provide reasonable notice for any necessary rescheduling or changes.</ListItem>
                  <ListItem>Comply with our rescheduling policies.</ListItem>
                </ul>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.5} duration={0.6}>
              <section>
                <SectionTitle>4. Payment Terms</SectionTitle>
                
                <SectionTitle level={3}>4.1 Fees and Payment Processing</SectionTitle>
                <Paragraph>
                  All payments for Services must be processed through our Platform's payment system. We utilize industry-standard payment processors to ensure secure and reliable transactions. By using our Platform, you agree to the following payment terms:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem><strong>Consultation Fees:</strong> All consultation fees are set by the Expert and displayed on their profile.</ListItem>
                  <ListItem><strong>Subscription Fees:</strong> Subscription fees are also determined by the Expert and clearly displayed as part of their Subscription Services.</ListItem>
                  <ListItem><strong>Pricing:</strong> All fees are listed and charged in United States dollars (USD).</ListItem>
                  <ListItem><strong>Payment Timing:</strong> Payment must be made at the time of booking for Consultation Calls and at the beginning of each billing cycle for Subscription Services.</ListItem>
                </ul>
                <Paragraph>
                  Please note that all prices for the Services are set exclusively by the Expert, and myfirstcheque has no involvement in determining the amount an Expert charges for their services. The prices displayed on the website, including the Expert's consultation or subscription fees, are inclusive of Stripe's standard processing fees. As a result, the Learner pays the exact amount displayed on the website at the time of booking or subscribing.
                </Paragraph>
                <Paragraph>
                  The Platform charges a 10% platform fee on all transactions conducted through the Platform, including both Consultation Calls and Subscription Service payments.
                </Paragraph>
                <Paragraph>
                  We use Stripe as our payment processor, so the actual payment processing fees may vary slightly. For details on Stripe's fees, please refer to their pricing page.
                </Paragraph>
                <Paragraph>
                  The Expert receives the remaining amount after the platform fee and any applicable Stripe processing fees.
                </Paragraph>
                <Paragraph>
                  The Platform reserves the right to adjust its fee structure at any time, with notice to users, in order to reflect changes in payment processing costs, business needs, or other factors.
                </Paragraph>

                <SectionTitle level={3}>4.2 Expert Payout Schedule</SectionTitle>
                <Paragraph>
                  Experts must connect a payment processor account (e.g., Stripe) to the Platform during onboarding. They may either link an existing account or create a new one through the onboarding process. The Expert is solely responsible for managing their payment settings, including payout frequency and method, via their connected payment processor.
                </Paragraph>
                <Paragraph>
                  The Expert can view their current payout account status and transaction history at any time in their myfirstcheque Dashboard. Payouts are processed according to the schedule and terms defined by the Expert's connected payment processor.
                </Paragraph>
                <Paragraph>
                  The Platform does not control the timing or frequency of payouts and is not liable for any delays related to the payment processor's verification or disbursement processes.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.6} duration={0.6}>
              <section>
                <SectionTitle>5. User Conduct and Professional Standards</SectionTitle>
                
                <SectionTitle level={3}>5.1 General User Conduct</SectionTitle>
                <Paragraph>
                  All Users of the Platform agree to conduct themselves in a professional, lawful, and ethical manner. Users shall not engage in any conduct that could damage, disable, overburden, or impair the Platform or interfere with any other party's use of the Platform. This includes, but is not limited to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem><strong>Attempt to Access Other Users' Accounts or Unauthorized Areas of the Platform:</strong> Users shall not attempt to access any other User's account, private information, or any portion of the Platform to which they have not been explicitly granted access. Unauthorized access is strictly prohibited.</ListItem>
                  <ListItem><strong>Use of Devices, Software, or Routines That Interfere with the Platform's Operation:</strong> Users shall not use any device, software, or routine that interferes with the proper functioning or security of the Platform. This includes any actions that may cause an unreasonable load on the Platform's infrastructure or otherwise disrupt its operations.</ListItem>
                  <ListItem><strong>Introduce Malicious or Technologically Harmful Materials:</strong> Users shall not introduce any viruses, trojan horses, worms, logic bombs, or any other harmful or malicious materials into the Platform. Such actions may cause harm to the Platform, its users, or the broader internet ecosystem.</ListItem>
                  <ListItem><strong>Attempt Unauthorized Access or Disrupt Platform Operations:</strong> Users shall not attempt to gain unauthorized access to, interfere with, damage, or disrupt any portion of the Platform, its servers, or the underlying networks. This includes any activities designed to bypass security protocols or hinder the normal operation of the Platform.</ListItem>
                  <ListItem><strong>Conduct Denial-of-Service Attacks:</strong> Users shall not engage in or attempt to execute denial-of-service (DoS) attacks or distributed denial-of-service (DDoS) attacks against the Platform. These actions aim to overload and disrupt the normal functioning of the Platform, preventing other Users from accessing services.</ListItem>
                  <ListItem><strong>Make Unauthorized Use of the Platform:</strong> Users shall not make unauthorized use of the Platform, including but not limited to, collecting usernames, email addresses, or other personal information of Users by electronic or other means for any unauthorized purposes. This includes using bots or other tools to gather such information for spamming, phishing, or other malicious activities.</ListItem>
                  <ListItem><strong>Tax and Reporting Responsibility:</strong> All Users, both Experts and Learners, are solely responsible for managing their own taxes and complying with any other legally required payments or reporting in connection with the Services purchased or provided on the Platform. The Platform is not liable for any tax obligations or reporting requirements, and Users agree to indemnify the Platform against any claims, fines, or penalties resulting from their failure to meet such obligations.</ListItem>
                </ul>

                <SectionTitle level={3}>5.2 Expert Professional Standards</SectionTitle>
                <Paragraph>
                  Experts using our Platform agree to maintain the highest standards of professional conduct and service delivery. Experts must:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Maintain Necessary Professional Licenses, Certifications, and Credentials: Experts are responsible for ensuring they hold and maintain all required professional licenses, certifications, and credentials that are legally necessary or industry-standard for their field of expertise. It is the Expert's responsibility to ensure that all qualifications are current and valid throughout the duration of their services.</ListItem>
                  <ListItem>Be Punctual and Prepared for Scheduled Services: Experts are expected to attend all scheduled Services on time and be fully prepared to deliver a high-quality session. This includes having the necessary materials, resources, and relevant information ready to provide the best possible experience for Learners.</ListItem>
                  <ListItem>Provide Accurate and Truthful Information About Their Qualifications, Experience, and Expertise: Experts must provide truthful, accurate, and up-to-date information regarding their qualifications, experience, and areas of expertise. Any misrepresentation of credentials, qualifications, or professional background is prohibited and may result in removal from the Platform.</ListItem>
                  <ListItem>Deliver Services in Accordance with Professional Standards: Experts agree to deliver their services in accordance with the applicable professional standards, guidelines, and ethical practices relevant to their field of expertise. Services should be conducted with care, competence, and integrity at all times.</ListItem>
                  <ListItem>Maintain Appropriate Professional Liability Insurance: Experts are required to maintain appropriate professional liability insurance, as mandated by applicable laws or industry regulations. It is the Expert's responsibility to ensure that their insurance coverage is sufficient for the scope of services offered on the Platform.</ListItem>
                  <ListItem>Respect Learner Confidentiality and Privacy: Experts must respect the confidentiality and privacy of all Learners and clients in accordance with professional standards, privacy laws, and regulations, including any data protection laws applicable to the services they provide. Experts must not disclose or use any personal information obtained during consultations for purposes other than providing the agreed-upon services.</ListItem>
                  <ListItem>Refrain from Providing Services Outside Their Area of Expertise: Experts agree not to provide services outside the scope of their professional competence or expertise. They are expected to acknowledge their limitations and refrain from offering advice or services that they are not qualified to provide. If a consultation or request falls outside their area of expertise, Experts must either decline the service or refer the Learner to another qualified professional.</ListItem>
                </ul>

                <SectionTitle level={3}>5.3 Learner Responsibilities</SectionTitle>
                <Paragraph>
                  Learners using our Platform agree to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem><strong>Provide Accurate and Complete Information:</strong> When booking Consultation Calls or Subscription Services, Learners are required to provide true, accurate, and complete information, including but not limited to their personal details, contact information, and any necessary background information related to the consultation. This ensures that the Expert can prepare appropriately and deliver a valuable service.</ListItem>
                  <ListItem><strong>Attend Scheduled Services Punctually and Be Prepared:</strong> Learners are expected to attend scheduled Services at the agreed-upon time and be prepared to engage fully in the session. This includes ensuring the availability of any necessary materials, questions, or background information to make the Services as effective as possible.</ListItem>
                  <ListItem><strong>Treat Experts with Professional Courtesy and Respect:</strong> Learners must treat Experts with the same level of professionalism, courtesy, and respect that is expected in any professional or educational setting. Disrespectful or inappropriate behavior, including harassment, will not be tolerated and may result in account suspension or termination.</ListItem>
                  <ListItem><strong>Pay for Services as Agreed and Comply with Platform Payment Policies:</strong> Learners agree to pay for the Services they book in accordance with the agreed-upon fees. All payments must be made as per the Platform's payment policies, and Learners are responsible for any applicable taxes or fees associated with the Service. Non-payment or attempts to bypass the payment process may result in Service cancellation or account penalties.</ListItem>
                  <ListItem><strong>Use the Services for Legitimate Purposes Only:</strong> Learners agree to use the Platform and its Services only for legitimate and lawful purposes, in accordance with applicable laws and regulations. The Services may not be used for any illegal, harmful, or unethical activities, including but not limited to fraud, defamation, or intellectual property infringement.</ListItem>
                  <ListItem><strong>Respect Intellectual Property Rights:</strong> Learners acknowledge and agree to respect the intellectual property rights of Experts and the Platform. This includes, but is not limited to, not reproducing, distributing, or exploiting any content shared during consultations without explicit permission from the respective rights holder. All intellectual property related to the Platform's services remains the property of the Expert or myfirstcheque, as applicable.</ListItem>
                </ul>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.7} duration={0.6}>
              <section>
                <SectionTitle>6. Privacy and Data Protection</SectionTitle>
                
                <SectionTitle level={3}>6.1 Data Collection and Use</SectionTitle>
                <Paragraph>
                  We collect and process personal information as outlined in our Privacy Policy and Data Processing Agreement (DPA), which are incorporated into these Terms. All information provided must be accurate and complete. Our servers are located in the United States, and your personal data may be transferred and stored in the USA. For more detailed information, please refer to our Privacy Policy.
                </Paragraph>

                <SectionTitle level={3}>6.2 Account Deletion</SectionTitle>
                <Paragraph>
                  If you choose to delete your account, we will remove your user details from the Platform's user interface. However, for security and compliance purposes, we will retain relevant user data in our internal database.
                </Paragraph>
                <Paragraph>
                  If you wish to have all your user details permanently deleted from our database, you must send a written request to info@myfirstcheque.com. We will process such requests in accordance with applicable legal and regulatory requirements.
                </Paragraph>

                <SectionTitle level={3}>6.3 Confidentiality</SectionTitle>
                <Paragraph>
                  All Users agree to maintain the confidentiality of any proprietary or confidential information obtained through the Platform, including but not limited to:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Personal information of other Users</ListItem>
                  <ListItem>Content of consultation sessions</ListItem>
                  <ListItem>Business information related to the Platform</ListItem>
                  <ListItem>Technical information about the Platform</ListItem>
                </ul>

                <SectionTitle level={3}>6.4 Video Recording and Session Documentation</SectionTitle>
                <Paragraph>
                  Users acknowledge and agree that:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Video consultations may be recorded for quality assurance and compliance purposes</ListItem>
                  <ListItem>Recorded sessions are stored securely and accessed only by authorized personnel</ListItem>
                  <ListItem>Users must obtain explicit consent before recording any session</ListItem>
                  <ListItem>Recordings may be used for dispute resolution purposes</ListItem>
                </ul>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.8} duration={0.6}>
              <section>
                <SectionTitle>7. Intellectual Property Rights</SectionTitle>
                
                <SectionTitle level={3}>7.1 Platform Intellectual Property</SectionTitle>
                <Paragraph>
                  The Platform and its original content, features, and functionality are owned by Circles App, Inc. (DBA myfirstcheque) and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. Users agree not to copy, modify, create derivative works of, publicly display, publicly perform, republish, download, or transmit any of the material on our Platform without our express prior written consent.
                </Paragraph>

                <SectionTitle level={3}>7.2 User Content</SectionTitle>
                <Paragraph>
                  By submitting, posting, or displaying Content on or through the Platform, Users grant Circles App, Inc. (DBA myfirstcheque) a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such Content in any and all media or distribution methods now known or later developed. This license authorizes us to make your Content available to the rest of the world and to let others do the same.
                </Paragraph>

                <SectionTitle level={3}>7.3 Expert Materials</SectionTitle>
                <Paragraph>
                  Experts retain all intellectual property rights to the materials used in their Services and professional content. However, Experts grant Learners a limited, non-exclusive license to use the Consultation Call and Subscription Service materials solely for their personal, non-commercial purposes.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={0.9} duration={0.6}>
              <section>
                <SectionTitle>8. Disclaimers and Limitations of Liability</SectionTitle>
                
                <SectionTitle level={3}>8.1 Service Disclaimer</SectionTitle>
                <Paragraph>
                  THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. Circles App, Inc. (DBA myfirstcheque) MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
                </Paragraph>

                <SectionTitle level={3}>8.2 Professional Advice Disclaimer</SectionTitle>
                <Paragraph>
                  Circles App, Inc. (DBA myfirstcheque) is not a professional services provider and does not provide professional advice or services. We act solely as a platform connecting Experts with Learners. Any opinions, advice, services, or other information provided by Experts are those of the respective Expert and not of Circles App, Inc. (DBA myfirstcheque). We do not endorse, guarantee, or take responsibility for any Expert's services or advice.
                </Paragraph>

                <SectionTitle level={3}>8.3 Limitation of Liability</SectionTitle>
                <Paragraph>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL Circles App, Inc. (DBA myfirstcheque), ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Your access to or use of or inability to access or use the Platform</ListItem>
                  <ListItem>Any conduct or Content of any third party on the Platform</ListItem>
                  <ListItem>Any Content obtained from the Platform</ListItem>
                  <ListItem>Unauthorized access, use, or alteration of your transmissions or Content</ListItem>
                </ul>
              </section>
            </SmoothReveal>

            {/* Section 9: Dispute Resolution */}
            <SmoothReveal delay={1.0} duration={0.6}>
              <section>
                <SectionTitle>9. Dispute Resolution</SectionTitle>
                <Paragraph>
                  In the event of any dispute arising out of or relating to these Terms or the Platform, Users agree to first attempt to resolve the dispute informally by reaching out directly to Circles App, Inc. (DBA myfirstcheque). The following process should be followed before resorting to formal dispute resolution methods:
                </Paragraph>

                <SectionTitle level={3}>9.1.1 Informal Resolution</SectionTitle>
                <Paragraph>
                  The party with a grievance must follow these steps:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem><strong>Dispute Notification:</strong> The party initiating the dispute must provide written notice to the other party. This notice must detail the nature of the dispute, relevant facts, and the damages claimed. The notice should be sent via email to the recipient's registered email address or to Circles App, Inc. (DBA myfirstcheque) at info@myfirstcheque.com. This notice will be referred to as the "Dispute Notification."</ListItem>
                  <ListItem><strong>Response Time:</strong> The recipient of the Dispute Notification will have thirty (30) days from the receipt of the notice to provide a written response.</ListItem>
                  <ListItem><strong>Follow-Up:</strong> After the response has been received, the initiating party will have an additional fifteen (15) days to reply to the response, addressing any new information or clarifications.</ListItem>
                </ul>

                <SectionTitle level={3}>9.1.2 Escalation to Formal Resolution</SectionTitle>
                <Paragraph>
                  If the dispute remains unresolved after the informal process, either party may escalate the issue by requesting mediation. Both parties must mutually agree to mediation before proceeding, and the request for mediation must be filed with the American Arbitration Association (AAA). The steps are as follows:
                </Paragraph>
                <Paragraph>
                  For claims valued under $10,000, either party may file a Request for AAA Online Mediation through the AAA's website (https://www.aaamediation.org). For claims exceeding $10,000, mediation must be initiated by filing a Request for Mediation with the AAA. If both parties agree to proceed with mediation, the associated costs will be shared equally.
                </Paragraph>

                <SectionTitle level={3}>9.2 Binding Arbitration</SectionTitle>
                <Paragraph>
                  If a dispute cannot be resolved through informal resolution or mediation, the parties agree to resolve any dispute arising from or related to these Terms or the Platform through binding arbitration. The arbitration shall be administered by the American Arbitration Association (AAA) in accordance with its applicable rules and procedures, with proceedings conducted in California unless the parties mutually agree to an alternative location. The arbitrator's decision shall be final and binding on both parties, and judgment on the award may be entered in any court of competent jurisdiction.
                </Paragraph>
                <Paragraph>
                  <strong>Covered Claims:</strong> Arbitration shall apply to all claims, including but not limited to breach of contract, discrimination, harassment, negligence, and wage disputes. Both parties expressly waive their right to a trial in court.
                </Paragraph>
                <Paragraph>
                  <strong>Arbitration Rules & Arbitrator Selection:</strong> Arbitration will be conducted under the AAA's Commercial Arbitration Rules. The parties shall have 30 days from notice of arbitration to jointly select an arbitrator. If they cannot reach an agreement, the arbitrator will be appointed by the AAA.
                </Paragraph>
                <Paragraph>
                  <strong>Authority of the Arbitrator:</strong> The arbitrator shall have full authority to grant remedies, rule on dispositive motions, issue subpoenas, and resolve any disputes regarding the interpretation, applicability, or enforceability of this arbitration agreement.
                </Paragraph>

                <SectionTitle level={3}>9.3 Class Action Waiver</SectionTitle>
                <Paragraph>
                  YOU AND Circles App, Inc. (DBA myfirstcheque) AGREE THAT ANY CLAIMS OR DISPUTES ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM MUST BE BROUGHT ON AN INDIVIDUAL BASIS ONLY. YOU AND Circles App, Inc. (DBA myfirstcheque) AGREE THAT YOU WILL NOT PARTICIPATE IN ANY CLASS, COLLECTIVE, OR REPRESENTATIVE ACTION, AND THAT YOU WAIVE ANY RIGHT TO SEEK RELIEF AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING. This provision applies to any claims, whether in mediation or arbitration, and prohibits the consolidation of individual claims into a class action.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={1.1} duration={0.6}>
              <section>
                <SectionTitle>10. Term and Termination</SectionTitle>
                
                <SectionTitle level={3}>10.1 Term</SectionTitle>
                <Paragraph>
                  These Terms shall remain in full force and effect while you use the Platform or maintain an account with us. Notwithstanding the termination or expiration of your account, certain provisions of these Terms, including but not limited to those relating to dispute resolution, indemnification, and limitations of liability, shall remain in effect and continue to bind the parties even after you no longer have an account with the Platform.
                </Paragraph>

                <SectionTitle level={3}>10.2 Termination Rights</SectionTitle>
                <Paragraph>
                  Circles App, Inc. (DBA myfirstcheque) reserves the right, in its sole discretion, to terminate your access to the Platform, or any portion thereof, at any time and for any reason, including, without limitation:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>Violation of these Terms</ListItem>
                  <ListItem>At the request of law enforcement or government agencies</ListItem>
                  <ListItem>Discontinuance or material modification of the Platform</ListItem>
                  <ListItem>Unexpected technical or security issues</ListItem>
                  <ListItem>Extended periods of inactivity</ListItem>
                  <ListItem>Engagement in fraudulent or illegal activities</ListItem>
                </ul>

                <SectionTitle level={3}>10.3 Effect of Termination</SectionTitle>
                <Paragraph>
                  Upon termination of your account:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <ListItem>All rights granted to you under these Terms will immediately cease</ListItem>
                  <ListItem>You must cease all use of the Platform</ListItem>
                  <ListItem>Any fees paid are non-refundable</ListItem>
                  <ListItem>All pending transactions will be cancelled or completed at our discretion</ListItem>
                  <ListItem>We may delete or retain your Content at our discretion</ListItem>
                </ul>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={1.2} duration={0.6}>
              <section>
                <SectionTitle>11. Modifications to Terms</SectionTitle>
                
                <SectionTitle level={3}>11.1 Changes to Terms</SectionTitle>
                <Paragraph>
                  We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 15 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </Paragraph>

                <SectionTitle level={3}>11.2 Continued Use</SectionTitle>
                <Paragraph>
                  By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised Terms. If you do not agree to the new Terms, you are no longer authorized to use the Platform.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={1.3} duration={0.6}>
              <section>
                <SectionTitle>12. Governing Law</SectionTitle>
                <Paragraph>
                  These Terms and your use of the Platform shall be governed by, and construed in accordance with, the laws of the State of California, without regard to its conflict of law principles. This means that any disputes, claims, or legal proceedings related to these Terms or the use of the Platform shall be resolved under California law, regardless of where you or your company are located.
                </Paragraph>
                <Paragraph>
                  The parties acknowledge that any legal action or proceeding arising under these Terms will be subject to the exclusive jurisdiction and venue of the courts located in California, and you consent to the personal jurisdiction of such courts.
                </Paragraph>
              </section>
            </SmoothReveal>

            {/* Section 13: Miscellaneous */}
            <SmoothReveal delay={1.4} duration={0.6}>
              <section>
                <SectionTitle>13. Miscellaneous Provisions</SectionTitle>
                
                <SectionTitle level={3}>13.1 Severability</SectionTitle>
                <Paragraph>
                  If any provision of these Terms is found to be invalid, unenforceable, or void by a court of competent jurisdiction, such provision will be deemed ineffective only to the extent of the invalidity or unenforceability. The remainder of the Terms, including all unaffected provisions, will continue in full force and effect.
                </Paragraph>

                <SectionTitle level={3}>13.2 Assignment</SectionTitle>
                <Paragraph>
                  You may not assign, transfer, or delegate any of your rights or obligations under these Terms to any third party. However, Circles App, Inc. (DBA myfirstcheque) reserves the right to assign, transfer, or delegate its rights and obligations under these Terms to any entity, at its discretion, without notice to you or your consent.
                </Paragraph>

                <SectionTitle level={3}>13.3 Entire Agreement</SectionTitle>
                <Paragraph>
                  These Terms, together with the Privacy Policy, the Data Processing Agreement (DPA) and any other legal notices published by Circles App, Inc. (DBA myfirstcheque) on the Platform, represents the complete and exclusive agreement between you and Circles App, Inc. (DBA myfirstcheque) concerning your use of the Platform. They supersede all prior or contemporaneous agreements, communications, and representations, whether oral or written, regarding the subject matter.
                </Paragraph>

                <SectionTitle level={3}>13.4 No Waiver</SectionTitle>
                <Paragraph>
                  The failure of Circles App, Inc. (DBA myfirstcheque) to enforce any provision or right under these Terms shall not be construed as a waiver of such provision or right. No waiver of any provision of these Terms will be deemed a continuing waiver, and any failure to assert any right or provision shall not operate as a waiver of future enforcement of the same.
                </Paragraph>

                <SectionTitle level={3}>13.5 Use of DBA Name</SectionTitle>
                <Paragraph>
                  Circles App, Inc. operates the Platform under the registered Doing Business As (DBA) name myfirstcheque. All references to "myfirstcheque" in these Terms, Privacy Policy, and associated agreements shall be understood as references to Circles App, Inc.
                </Paragraph>
              </section>
            </SmoothReveal>

            <SmoothReveal delay={1.5} duration={0.6}>
              <section className="border-t border-gray-200 pt-8 mt-12">
                <SectionTitle>Contact Information</SectionTitle>
                <Paragraph>
                  <strong>Circles App, Inc. (DBA myfirstcheque)</strong>
                </Paragraph>
                <Paragraph>
                  Headquarters: 237 Watson Drive Campbell, CA 95008 United States
                </Paragraph>
                <Paragraph>
                  Email: <a href="mailto:info@myfirstcheque.com" className="text-black hover:underline">info@myfirstcheque.com</a>
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
