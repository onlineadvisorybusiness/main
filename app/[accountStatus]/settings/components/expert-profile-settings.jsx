'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Building2, 
  Star, 
  Plus, 
  Trash2, 
  Upload,
  Save,
  Loader2,
  Calendar,
  MessageSquare,
  X,
  Share2
} from 'lucide-react'
import Image from 'next/image'

export default function ExpertProfileSettings() {
  const { user } = useUser()
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    aboutMe: '',
    position: '',
    company: '',
    bio: '',
    avatar: '',
    linkedinUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    websiteUrl: ''
  })
  
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    reviewerAvatar: '',
    reviewerName: '',
    position: '',
    company: '',
    message: '',
    stars: 5,
    source: 'direct',
    feedbackDate: new Date().toISOString().split('T')[0]
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingReviewerAvatar, setIsUploadingReviewerAvatar] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const loadProfileData = async () => {
    if (user) {
      try {
        const response = await fetch('/api/users/get-profile')
        if (response.ok) {
          const data = await response.json()
          const dbUser = data.user

          setProfileData({
            firstName: dbUser.firstName || user.firstName || '',
            lastName: dbUser.lastName || user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            aboutMe: dbUser.aboutMe || user.unsafeMetadata?.aboutMe || '',
            position: dbUser.position || user.unsafeMetadata?.position || '',
            company: dbUser.company || user.unsafeMetadata?.company || '',
            bio: dbUser.bio || user.unsafeMetadata?.bio || '',
            avatar: dbUser.avatar || user.unsafeMetadata?.avatarUrl || user.imageUrl || '',
            linkedinUrl: dbUser.linkedinUrl || '',
            instagramUrl: dbUser.instagramUrl || '',
            facebookUrl: dbUser.facebookUrl || '',
            twitterUrl: dbUser.twitterUrl || '',
            youtubeUrl: dbUser.youtubeUrl || '',
            websiteUrl: dbUser.websiteUrl || ''
          })
          
          const dbReviews = dbUser.reviewsData || []
          const clerkReviews = user.unsafeMetadata?.reviews || []
          const userReviews = Array.isArray(dbReviews) && dbReviews.length > 0 ? dbReviews : clerkReviews
          
          setReviews(Array.isArray(userReviews) ? userReviews : [])
        } else {
          const avatarUrl = user.unsafeMetadata?.avatarUrl || user.imageUrl || ''
          
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            aboutMe: user.unsafeMetadata?.aboutMe || '',
            position: user.unsafeMetadata?.position || '',
            company: user.unsafeMetadata?.company || '',
            bio: user.unsafeMetadata?.bio || '',
            avatar: avatarUrl
          })
          
          const userReviews = user.unsafeMetadata?.reviews || []
          setReviews(Array.isArray(userReviews) ? userReviews : [])
        }
      } catch (error) {
        const avatarUrl = user.unsafeMetadata?.avatarUrl || user.imageUrl || ''
        
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.emailAddresses[0]?.emailAddress || '',
          aboutMe: user.unsafeMetadata?.aboutMe || '',
          position: user.unsafeMetadata?.position || '',
          company: user.unsafeMetadata?.company || '',
          bio: user.unsafeMetadata?.bio || '',
          avatar: avatarUrl
        })
        
        const userReviews = user.unsafeMetadata?.reviews || []
        setReviews(Array.isArray(userReviews) ? userReviews : [])
      }
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [user])
  
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, PNG, GIF, or WebP image.",
        variant: "destructive"
      })
      return
    }

    setIsUploadingAvatar(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.imageUrl

      setProfileData(prev => ({
        ...prev,
        avatar: imageUrl
      }))

      setHasUnsavedChanges(true)
      
      toast({
        title: "Avatar Uploaded",
        description: "Your profile picture has been uploaded. Click 'Save Profile' to save changes.",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleReviewerAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, PNG, GIF, or WebP image.",
        variant: "destructive"
      })
      return
    }

    setIsUploadingReviewerAvatar(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.imageUrl

      setNewReview(prev => ({
        ...prev,
        reviewerAvatar: imageUrl
      }))
      
      toast({
        title: "Reviewer Avatar Uploaded",
        description: "Reviewer's profile picture has been uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload reviewer's profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingReviewerAvatar(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
  }

  const addReview = () => {
    if (!newReview.reviewerName || !newReview.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in reviewer name and message.",
        variant: "destructive"
      })
      return
    }

    const review = {
      id: Date.now().toString(),
      ...newReview,
      feedbackDate: new Date(newReview.feedbackDate).toISOString()
    }
      
    setReviews(prev => {
      const newReviews = [...prev, review]
      return newReviews
    })
    
    setNewReview({
      reviewerAvatar: '',
      reviewerName: '',
      position: '',
      company: '',
      message: '',
      stars: 5,
      source: 'direct',
      feedbackDate: new Date().toISOString().split('T')[0]
    })

    setHasUnsavedChanges(true)

    toast({
      title: "Review Added",
      description: "New review has been added successfully.",
    })
  }

  const removeReview = (reviewId) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId))
    setHasUnsavedChanges(true)
    toast({
      title: "Review Removed",
      description: "Review has been removed. Click 'Save Profile' to save changes.",
    })
  }

  const saveProfile = async () => {
    setIsSaving(true)
    
    try {
      const clerkUpdateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      }
      
      await user.update(clerkUpdateData)
      
      if (profileData.avatar && profileData.avatar !== user.imageUrl) {
        try {
          const response = await fetch(profileData.avatar)
          const blob = await response.blob()
          const file = new File([blob], 'avatar.jpg', { type: blob.type })
          
          await user.setProfileImage({ file })
        } catch (avatarError) {
        }
      }
      
      try {
        const metadataToUpdate = {
          aboutMe: profileData.aboutMe,
          position: profileData.position,
          company: profileData.company,
          bio: profileData.bio,
          reviews: reviews
        }
               
        await user.update({
          unsafeMetadata: metadataToUpdate
        })
      } catch (metadataError) {
      }

      const dbUpdateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatarUrl: profileData.avatar,
        aboutMe: profileData.aboutMe,
        position: profileData.position,
        company: profileData.company,
        bio: profileData.bio,
        linkedinUrl: profileData.linkedinUrl,
        instagramUrl: profileData.instagramUrl,
        facebookUrl: profileData.facebookUrl,
        twitterUrl: profileData.twitterUrl,
        youtubeUrl: profileData.youtubeUrl,
        websiteUrl: profileData.websiteUrl,
        reviews: reviews
      }
      
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbUpdateData)
      })

      if (response.ok) {
        const result = await response.json()
      } else {
        const error = await response.json()
      }

      setHasUnsavedChanges(false)
      setIsEditMode(false)
      await loadProfileData()
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully in both Clerk and database.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your profile information and reviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode ? (
              <Button 
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setIsEditMode(false)
                  setHasUnsavedChanges(false)
                }}
                variant="outline"
                className="px-6 py-2"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm">
                  {profileData.avatar ? (
                    <Image
                      src={profileData.avatar}
                      alt="Profile Avatar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditMode && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 bg-gray-800 text-white p-2.5 rounded-full cursor-pointer hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar || !isEditMode}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Profile Picture</h3>
                <p className="text-gray-600 mb-3">
                  Click the upload icon to change your profile picture
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Upload Requirements</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-700">Size:</span>
                        <span className="text-gray-600 ml-1">400×400px minimum</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-700">Formats:</span>
                        <span className="text-gray-600 ml-1">JPG, PNG, GIF, WebP</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-700">File size:</span>
                        <span className="text-gray-600 ml-1">Maximum 10MB</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-700">Quality:</span>
                        <span className="text-gray-600 ml-1">Square aspect ratio preferred</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-700">Visibility:</span>
                        <span className="text-gray-600 ml-1">Ensure your face is clearly visible and well-lit</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isUploadingAvatar && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="h-11"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="h-11"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                value={profileData.email}
                disabled
                className="bg-gray-50 h-11"
              />
              <p className="text-sm text-gray-500">
                Email address cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Information displayed in marketplace and profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="h-11"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="e.g., Google, Microsoft"
                  className="h-11"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Short professional bio (displayed in marketplace)"
                rows={3}
                className="resize-none"
                disabled={!isEditMode}
              />
              <p className="text-sm text-gray-500">This will be displayed in the marketplace</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutMe" className="text-sm font-medium text-gray-700">About Me</Label>
              <Textarea
                id="aboutMe"
                value={profileData.aboutMe}
                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                placeholder="Detailed description about yourself, experience, and expertise"
                rows={6}
                className="resize-none"
                disabled={!isEditMode}
              />
              <p className="text-sm text-gray-500">This will be displayed on your profile page</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews and Testimonials
            </CardTitle>
            <CardDescription>
              Add and manage your reviews and testimonials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {isEditMode && (
              <div className="border rounded-lg p-6 bg-gray-50/50">
                <h3 className="font-semibold text-lg text-gray-900 mb-6">Add New Review</h3>
              
              {/* Reviewer Avatar Section */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Reviewer Avatar (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                      {newReview.reviewerAvatar ? (
                        <Image
                          src={newReview.reviewerAvatar}
                          alt="Reviewer Avatar"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="reviewer-avatar-upload"
                      className="absolute -bottom-1 -right-1 bg-gray-800 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white"
                    >
                      <Upload className="h-3 w-3" />
                    </label>
                    <input
                      id="reviewer-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleReviewerAvatarUpload}
                      className="hidden"
                      disabled={isUploadingReviewerAvatar || !isEditMode}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a profile picture for the reviewer
                    </p>
                    {isUploadingReviewerAvatar && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <p>• JPG, PNG, GIF, WebP formats</p>
                      <p>• Maximum 10MB file size</p>
                      <p>• Square aspect ratio preferred</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reviewerName" className="text-sm font-medium text-gray-700">Reviewer Name *</Label>
                  <Input
                    id="reviewerName"
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewerName: e.target.value }))}
                    placeholder="Enter reviewer name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewerPosition" className="text-sm font-medium text-gray-700">Position</Label>
                  <Input
                    id="reviewerPosition"
                    value={newReview.position}
                    onChange={(e) => setNewReview(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., CEO, Manager"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewerCompany" className="text-sm font-medium text-gray-700">Company</Label>
                  <Input
                    id="reviewerCompany"
                    value={newReview.company}
                    onChange={(e) => setNewReview(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewSource" className="text-sm font-medium text-gray-700">Review Source</Label>
                  <Select
                    value={newReview.source}
                    onValueChange={(value) => setNewReview(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger className="h-11 w-full min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="clutch">Clutch</SelectItem>
                      <SelectItem value="upwork">Upwork</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewStars" className="text-sm font-medium text-gray-700">Rating</Label>
                  <Select
                    value={newReview.stars.toString()}
                    onValueChange={(value) => setNewReview(prev => ({ ...prev, stars: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-11 w-full min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(star => (
                        <SelectItem key={star} value={star.toString()}>
                          {renderStars(star)} ({star} star{star !== 1 ? 's' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedbackDate" className="text-sm font-medium text-gray-700">Feedback Date</Label>
                  <Input
                    id="feedbackDate"
                    type="date"
                    value={newReview.feedbackDate}
                    onChange={(e) => setNewReview(prev => ({ ...prev, feedbackDate: e.target.value }))}
                    className="h-11 w-full"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <Label htmlFor="reviewMessage" className="text-sm font-medium text-gray-700">Message *</Label>
                <Textarea
                  id="reviewMessage"
                  value={newReview.message}
                  onChange={(e) => setNewReview(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter the review message"
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={addReview} className="px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </div>
            </div>
            )}


            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Your Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium">No reviews added yet</p>
                  <p className="text-gray-500 text-sm mt-1">Add your first review above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                              {review.reviewerAvatar ? (
                                <Image
                                  src={review.reviewerAvatar}
                                  alt="Reviewer Avatar"
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                              <p className="text-sm text-gray-600">
                                {review.position && `${review.position}`}
                                {review.position && review.company && ' at '}
                                {review.company}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(review.stars)}
                            </div>
                            <Badge variant="outline" className="text-xs">{review.source.charAt(0).toUpperCase() + review.source.slice(1)}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(review.feedbackDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.message}</p>
                        </div>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReview(review.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media Links
            </CardTitle>
            <CardDescription>
              Add your social media profiles to help clients connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={profileData.linkedinUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={profileData.instagramUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/yourprofile"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  value={profileData.facebookUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/yourprofile"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                <Input
                  id="twitterUrl"
                  value={profileData.twitterUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                  placeholder="https://x.com/yourprofile"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  value={profileData.youtubeUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/@yourchannel"
                  disabled={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={profileData.websiteUrl}
                  onChange={(e) => setProfileData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditMode && (
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button 
              onClick={saveProfile} 
              disabled={isSaving} 
              size="lg" 
              className={`px-8 ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasUnsavedChanges ? 'Save Changes' : 'Save Profile'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
