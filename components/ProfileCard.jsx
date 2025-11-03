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
import { Skeleton } from '@/components/ui/skeleton'
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
  MessageSquare,
  X,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Edit,
  Check
} from 'lucide-react'
import Image from 'next/image'

export function ProfileCard({ userStatus, onClose }) {
  const { user } = useUser()
  const { toast } = useToast()
  
  // Add a simple check to ensure component renders
  if (!userStatus) {
    return null
  }
  
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
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingReviewerAvatar, setIsUploadingReviewerAvatar] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const loadProfileData = async () => {
    if (user) {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
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

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
  }

  const saveProfile = async () => {
    setIsSaving(true)
    
    try {
      // Update Clerk profile
      await user.update({
        firstName: profileData.firstName,
        lastName: profileData.lastName
      })
      
      if (profileData.avatar && profileData.avatar !== user.imageUrl) {
        try {
          const response = await fetch(profileData.avatar)
          const blob = await response.blob()
          const file = new File([blob], 'avatar.jpg', { type: blob.type })
          
          await user.setProfileImage({ file })
        } catch (avatarError) {
        }
      }
      
      // Update metadata for experts
      if (userStatus === 'expert') {
        try {
          await user.update({
            unsafeMetadata: {
              aboutMe: profileData.aboutMe,
              position: profileData.position,
              company: profileData.company,
              bio: profileData.bio,
              reviews: reviews
            }
          })
        } catch (metadataError) {
        }
      }

      // Update database
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
        const result = await response.json()    // eslint-disable-line no-unused-vars
      } else {
        const error = await response.json()
      }

      setHasUnsavedChanges(false)
      setIsEditMode(false)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
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

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      })
      return
    }

    setIsChangingPassword(true)
    
    try {
      await user.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (isLoading) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          
          <div className="p-6 space-y-4 overflow-y-auto flex-1 rounded-b-2xl">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
            
            {userStatus === 'expert' && (
              <>
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Skeleton className="h-8 w-8 mx-auto mb-2" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {userStatus === 'learner' && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-6">
                    <Skeleton className="h-12 w-12 mx-auto mb-3" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-600">
              {userStatus === 'expert' ? 'Manage your expert profile' : 'Manage your learner profile'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button 
                type="button"
                onClick={() => setIsEditMode(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={() => {
                  setIsEditMode(false)
                  setHasUnsavedChanges(false)
                }}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button 
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 rounded-b-2xl">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    {profileData.avatar ? (
                      <Image
                        src={profileData.avatar}
                        alt="Profile Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditMode && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 bg-gray-800 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-900 transition-all duration-200 shadow-lg"
                    >
                      <Upload className="h-3 w-3" />
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
                <div>
                  <h3 className="font-medium text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-600">
                    {isEditMode ? 'Click upload to change' : 'Your profile picture'}
                  </p>
                  {isUploadingAvatar && (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      <span className="text-xs text-blue-600">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-9"
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-9"
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50 h-9"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information for Experts */}
          {userStatus === 'expert' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g., Google, Microsoft"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Short professional bio"
                    rows={2}
                    className="resize-none"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMe" className="text-sm font-medium">About Me</Label>
                  <Textarea
                    id="aboutMe"
                    value={profileData.aboutMe}
                    onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                    placeholder="Detailed description about yourself"
                    rows={3}
                    className="resize-none"
                    disabled={!isEditMode}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews for Experts */}
          {userStatus === 'expert' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" />
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No reviews added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                            {review.reviewerAvatar ? (
                              <Image
                                src={review.reviewerAvatar}
                                alt="Reviewer Avatar"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{review.reviewerName}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.stars)}
                              </div>
                              <Badge variant="outline" className="text-xs">{review.source}</Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.message}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{reviews.length - 3} more reviews
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Password Change for Learners */}
          {userStatus === 'learner' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          placeholder="Enter current password"
                          className="h-9 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"  
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                          className="h-9 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                          className="h-9 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="button"
                        onClick={changePassword} 
                        disabled={isChangingPassword} 
                        size="sm"
                        variant="outline"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Click "Edit" to change your password</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media Links for Experts */}
          {userStatus === 'expert' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={profileData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl" className="text-sm font-medium">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      value={profileData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl" className="text-sm font-medium">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      value={profileData.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl" className="text-sm font-medium">Twitter/X URL</Label>
                    <Input
                      id="twitterUrl"
                      value={profileData.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      placeholder="https://x.com/yourprofile"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl" className="text-sm font-medium">YouTube URL</Label>
                    <Input
                      id="youtubeUrl"
                      value={profileData.youtubeUrl}
                      onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-sm font-medium">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={profileData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="h-9"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isEditMode && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button 
                type="button"
                onClick={saveProfile} 
                disabled={isSaving} 
                className={`px-6 ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
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
    </div>
  )
}
