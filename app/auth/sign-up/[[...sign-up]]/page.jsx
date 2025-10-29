'use client'

import { Button } from '@/components/ui/button'
import { SignUp } from '@clerk/nextjs'
import NextImage from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex relative">

      <Button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors px-4 py-2 rounded-lg shadow-md border border-gray-200"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
        <span className="text-gray-700 font-medium">Back</span>
      </Button>

      <div className="hidden lg:flex lg:w-1/2 relative">
        <NextImage 
          src="/startup-founder.jpg" 
          alt="Startup Founder Logo" 
          fill 
          className="object-cover w-full h-full" 
          priority
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
                    
          <div className="hidden lg:block mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">Enter your details to join the community</p>
          </div>
          
          <div className="bg-white rounded-lg lg:shadow-none lg:p-0">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case transition-colors',
                  card: 'shadow-none border-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 transition-colors',
                  formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 transition-colors',
                  formFieldLabel: 'text-gray-700 font-medium',
                  identityPreviewText: 'text-gray-900',
                  identityPreviewEditButton: 'text-blue-600 hover:text-blue-700'
                }
              }}
              redirectUrl="/marketplace"
              signInUrl="/auth/sign-in"
            />
          </div>
          
        </div>
      </div>
    </div>
  )
}
