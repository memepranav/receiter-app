'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'admin'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    // Only check auth if we're not on the login page
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      checkAuth()
    } else {
      // On login page, just check if we have a token and redirect if already authenticated
      const token = localStorage.getItem('admin_token')
      if (token) {
        // Verify token without showing loading state
        verifyTokenAndRedirect(token)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  const verifyTokenAndRedirect = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        const user = userData.data || userData
        setUser(user)
        router.push('/dashboard') // Redirect to dashboard if already authenticated
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('admin_token')
      }
    } catch (error) {
      // On error, remove token and stay on login page
      localStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      console.log('🔍 Auth Check:', { hasToken: !!token, tokenLength: token?.length })
      
      if (!token) {
        console.log('❌ No token found, user not authenticated')
        setIsLoading(false)
        return
      }

      console.log('🔄 Verifying token with backend...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📡 Auth response:', { status: response.status, ok: response.ok })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ Auth successful:', userData)
        // Handle the wrapped response structure from NestJS
        const user = userData.data || userData
        setUser(user)
      } else {
        console.log('❌ Auth failed, removing token. Status:', response.status)
        // Only remove token on 401/403, not on network errors
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('admin_token')
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error)
      
      if (error.name === 'AbortError') {
        console.log('⏱️ Auth check timed out - keeping token for retry')
      } else if (error.message?.includes('fetch')) {
        console.log('🔄 Network error during auth check - keeping token for retry')
      } else {
        console.log('❌ Auth check failed - removing token')
        localStorage.removeItem('admin_token')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('🔐 Attempting login for:', email)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📡 Login response:', { status: response.status, ok: response.ok })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Login failed:', errorData)
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      console.log('✅ Login successful:', data)
      
      // Handle the wrapped response structure from NestJS
      const responseData = data.data || data
      const token = responseData.accessToken || responseData.token
      
      console.log('💾 Storing token:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 50),
        fullResponse: responseData 
      })
      localStorage.setItem('admin_token', token)
      setUser(responseData.user)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}