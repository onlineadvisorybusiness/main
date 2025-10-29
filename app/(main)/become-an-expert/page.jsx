'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, User, Mail, Linkedin, UserCheck, Send, Loader2 } from 'lucide-react'
import NextImage from 'next/image'

export default function BecomeAnExpertPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: '',
    accountType: 'Expert'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/sign-in')
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        linkedin: '',
        accountType: 'Expert'
      })
    }
  }, [user, isLoaded, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateLinkedInURL = (url) => {
    const linkedinPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinPattern.test(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateLinkedInURL(formData.linkedin)) {
      alert('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/yourprofile)')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: {
          linkedin: formData.linkedin,
          accountType: formData.accountType
        }
      })

      const response = await fetch('/api/users/become-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          linkedinUrl: formData.linkedin
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update expert status')
      }

      const result = await response.json()
                   
      toast({
        title: "Success!",
        description: "Profile updated successfully! Welcome to the expert community!",
        duration: 3000,
      })
      
      setTimeout(() => {
        router.push('/expert/dashboard')
      }, 2000)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating profile. Please try again.",
        duration: 4000,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <NextImage
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop"
          alt="Professional team background"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Become an Expert</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    className="pl-10 bg-gray-50"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="pl-10"
                    required
                    pattern="https://.*linkedin\.com/in/.*"
                    title="Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    className="pl-10 bg-gray-50"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 relative">
                <NextImage
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                  alt="Ben Lang"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ben Lang</h3>
              <p className="text-gray-600 mb-6">Angel Investor</p>
              
              <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                "Turning your expertise into income but more importantly, impact has never been easier."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
