'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield, Edit, Save, X, Key, Settings, Server, Database, Lock, Globe, Upload, Clock, Coins } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

interface SystemConfig {
  jwt: {
    expiresIn: string
    refreshExpiresIn: string
  }
  cors: {
    origins: string
  }
  rateLimit: {
    window: number
    max: number
  }
  upload: {
    maxFileSize: number
    uploadDir: string
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
  }
  solana: {
    network: string
    rpcUrl: string
  }
  app: {
    name: string
    version: string
  }
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ProfilePageContent />
      </AdminLayout>
    </ProtectedRoute>
  )
}

function ProfilePageContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [configLoading, setConfigLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingConfig, setEditingConfig] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
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
  const [configData, setConfigData] = useState<SystemConfig>({
    jwt: { expiresIn: '1h', refreshExpiresIn: '30d' },
    cors: { origins: '' },
    rateLimit: { window: 900000, max: 100 },
    upload: { maxFileSize: 10485760, uploadDir: './uploads' },
    email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '' },
    solana: { network: 'devnet', rpcUrl: 'https://api.devnet.solana.com' },
    app: { name: 'Quran Reciter API', version: '1.0.0' }
  })

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchProfile()
      fetchSystemConfig()
    } else {
      // If no user, stop loading states
      setLoading(false)
      setConfigLoading(false)
    }
  }, [user]) // Depend on user state, not empty dependency

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('🔍 Fetching profile from:', `${apiUrl}/api/admin/auth/me`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        const profileData = result.data || result
        setProfile(profileData)
        setEditData({
          firstName: profileData.profile?.firstName || '',
          lastName: profileData.profile?.lastName || '',
          displayName: profileData.profile?.displayName || ''
        })
      } else if (response.status === 401) {
        console.error('Authentication failed - redirecting to login')
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/login'
        return
      } else if (response.status === 429) {
        console.error('Rate limited - too many requests to server API')
        // Don't set profile to null, keep trying
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Profile fetch timed out')
      } else {
        console.error('Error fetching profile:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        console.error('No authentication token found for system config')
        setConfigLoading(false)
        return
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('⚙️ Fetching system config from:', `${apiUrl}/api/admin/settings`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${apiUrl}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        const config = result.data || result
        setSystemConfig(config)
        setConfigData(config)
      } else if (response.status === 429) {
        console.error('Rate limited - too many requests to server API for system config')
        // Set default config to allow page to render
        const defaultConfig = {
          jwt: { expiresIn: '1h', refreshExpiresIn: '30d' },
          cors: { origins: '' },
          rateLimit: { window: 900000, max: 100 },
          upload: { maxFileSize: 10485760, uploadDir: './uploads' },
          email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '' },
          solana: { network: 'devnet', rpcUrl: 'https://api.devnet.solana.com' },
          app: { name: 'Quran Reciter API', version: '1.0.0' }
        }
        setSystemConfig(defaultConfig)
        setConfigData(defaultConfig)
      } else if (response.status === 401) {
        console.error('Authentication failed for system config - redirecting to login')
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/login'
        return
      } else {
        console.error('Failed to fetch system config:', response.status, response.statusText)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('System config fetch timed out')
      } else {
        console.error('Error fetching system config:', error)
      }
    } finally {
      setConfigLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
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

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try {
      const token = localStorage.getItem('admin_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      })

      if (response.ok) {
        const result = await response.json()
        const updatedConfig = result.data || result
        setSystemConfig(updatedConfig)
        setEditingConfig(false)
        alert('System configuration updated successfully!')
      } else {
        alert('Failed to update system configuration')
      }
    } catch (error) {
      console.error('Error updating system config:', error)
      alert('Error updating system configuration')
    } finally {
      setSavingConfig(false)
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/admin/auth/change-password`, {
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access this page.
          </p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!profile && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Profile Loading Issue</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load profile data. Your authentication might have expired.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/login'
              }} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 mr-2"
            >
              Login Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your admin account and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>System Configuration</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {profile?.profile?.displayName || 
                     `${profile?.profile?.firstName || ''} ${profile?.profile?.lastName || ''}`.trim() || 
                     'Admin User'}
                  </h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium capitalize">{profile?.role}</span>
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
                          firstName: profile?.profile?.firstName || '',
                          lastName: profile?.profile?.lastName || '',
                          displayName: profile?.profile?.displayName || ''
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
                  <p className="text-gray-900">{profile?.profile?.firstName || 'Not set'}</p>
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
                  <p className="text-gray-900">{profile?.profile?.lastName || 'Not set'}</p>
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
                  <p className="text-gray-900">{profile?.profile?.displayName || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{profile?.email}</span>
                  {profile?.status?.isEmailVerified && (
                    <span className="text-green-600 text-sm">(Verified)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Account Status</label>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${profile?.status?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={profile?.status?.isActive ? 'text-green-700' : 'text-red-700'}>
                    {profile?.status?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="capitalize">{profile?.role?.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Last Login</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {profile?.security?.lastLoginDate 
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
                  <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</span>
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
      )}

      {/* System Configuration Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {configLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">System Configuration</h2>
                  <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
                </div>
                <div className="flex space-x-2">
                  {!editingConfig ? (
                    <button
                      onClick={() => setEditingConfig(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Configuration</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{savingConfig ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingConfig(false)
                          setConfigData(systemConfig || {
                            jwt: { expiresIn: '1h', refreshExpiresIn: '30d' },
                            cors: { origins: '' },
                            rateLimit: { window: 900000, max: 100 },
                            upload: { maxFileSize: 10485760, uploadDir: './uploads' },
                            email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '' },
                            solana: { network: 'devnet', rpcUrl: 'https://api.devnet.solana.com' },
                            app: { name: 'Quran Reciter API', version: '1.0.0' }
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

              {/* JWT Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Key className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">JWT Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Access Token Expiry</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.jwt.expiresIn}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          jwt: { ...prev.jwt, expiresIn: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 1h, 30m, 7d"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.jwt.expiresIn || '1h'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Refresh Token Expiry</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.jwt.refreshExpiresIn}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          jwt: { ...prev.jwt, refreshExpiresIn: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 30d, 7d, 90d"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.jwt.refreshExpiresIn || '30d'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* CORS Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">CORS Configuration</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Allowed Origins</label>
                  {editingConfig ? (
                    <textarea
                      value={configData.cors.origins}
                      onChange={(e) => setConfigData(prev => ({ 
                        ...prev, 
                        cors: { ...prev.cors, origins: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="http://localhost:3000,https://yourdomain.com"
                    />
                  ) : (
                    <p className="text-gray-900">{systemConfig?.cors.origins || 'Not configured'}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Comma-separated list of allowed origins for CORS requests
                  </p>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Rate Limiting</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Window (ms)</label>
                    {editingConfig ? (
                      <input
                        type="number"
                        value={configData.rateLimit.window}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          rateLimit: { ...prev.rateLimit, window: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.rateLimit.window || 900000} ms</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Requests</label>
                    {editingConfig ? (
                      <input
                        type="number"
                        value={configData.rateLimit.max}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          rateLimit: { ...prev.rateLimit, max: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.rateLimit.max || 100}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">File Upload Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max File Size (bytes)</label>
                    {editingConfig ? (
                      <input
                        type="number"
                        value={configData.upload.maxFileSize}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          upload: { ...prev.upload, maxFileSize: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{(systemConfig?.upload.maxFileSize || 10485760).toLocaleString()} bytes</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Directory</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.upload.uploadDir}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          upload: { ...prev.upload, uploadDir: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.upload.uploadDir || './uploads'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Email Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Host</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.email.smtpHost}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          email: { ...prev.email, smtpHost: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.email.smtpHost || 'smtp.gmail.com'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Port</label>
                    {editingConfig ? (
                      <input
                        type="number"
                        value={configData.email.smtpPort}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          email: { ...prev.email, smtpPort: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.email.smtpPort || 587}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP User</label>
                    {editingConfig ? (
                      <input
                        type="email"
                        value={configData.email.smtpUser}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          email: { ...prev.email, smtpUser: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="your-email@example.com"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.email.smtpUser || 'Not configured'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Solana Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Coins className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Solana Blockchain Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Network</label>
                    {editingConfig ? (
                      <select
                        value={configData.solana.network}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          solana: { ...prev.solana, network: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="devnet">Devnet</option>
                        <option value="testnet">Testnet</option>
                        <option value="mainnet-beta">Mainnet</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{systemConfig?.solana.network || 'devnet'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RPC URL</label>
                    {editingConfig ? (
                      <input
                        type="url"
                        value={configData.solana.rpcUrl}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          solana: { ...prev.solana, rpcUrl: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.solana.rpcUrl || 'https://api.devnet.solana.com'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* App Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Server className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Application Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Application Name</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.app.name}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          app: { ...prev.app, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.app.name || 'Quran Reciter API'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Version</label>
                    {editingConfig ? (
                      <input
                        type="text"
                        value={configData.app.version}
                        onChange={(e) => setConfigData(prev => ({ 
                          ...prev, 
                          app: { ...prev.app, version: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="1.0.0"
                      />
                    ) : (
                      <p className="text-gray-900">{systemConfig?.app.version || '1.0.0'}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}