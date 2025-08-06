'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield, Edit, Save, X, Key } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface AdminProfile {
  id: string
  email: string
  profile: {
    firstName?: string
    lastName?: string
    displayName?: string
    avatar?: string
  }
  role: string
  status: {
    isActive: boolean
    isEmailVerified: boolean
  }
  security: {
    lastLoginDate?: string
    lastActivity?: string
  }
  createdAt: string
  updatedAt: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    displayName: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        const profileData = result.data || result
        setProfile(profileData)
        setEditData({
          firstName: profileData.profile?.firstName || '',
          lastName: profileData.profile?.lastName || '',
          displayName: profileData.profile?.displayName || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: editData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const updatedProfile = result.data || result
        setProfile(updatedProfile)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        alert('Password changed successfully')
        setShowChangePassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        alert(error.message || 'Error changing password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">Unable to load profile data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your admin account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {profile.profile?.displayName || 
                 `${profile.profile?.firstName || ''} ${profile.profile?.lastName || ''}`.trim() || 
                 'Admin User'}
              </h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium capitalize">{profile.role}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditData({
                      firstName: profile.profile?.firstName || '',
                      lastName: profile.profile?.lastName || '',
                      displayName: profile.profile?.displayName || ''
                    })
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            {editing ? (
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.profile?.firstName || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            {editing ? (
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.profile?.lastName || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            {editing ? (
              <input
                type="text"
                value={editData.displayName}
                onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.profile?.displayName || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900">{profile.email}</span>
              {profile.status.isEmailVerified && (
                <span className="text-green-600 text-sm">(Verified)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Account Status</label>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${profile.status.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={profile.status.isActive ? 'text-green-700' : 'text-red-700'}>
                {profile.status.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="capitalize">{profile.role.replace('_', ' ')}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Last Login</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>
                {profile.security.lastLoginDate 
                  ? new Date(profile.security.lastLoginDate).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Account Created</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Password & Security</h3>
          {!showChangePassword && (
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Key className="h-4 w-4" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {showChangePassword && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!showChangePassword && (
          <p className="text-muted-foreground">
            Keep your account secure by using a strong password and changing it regularly.
          </p>
        )}
      </div>
    </div>
  )
}