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
    checkAuth()
  }, [])

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
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('📡 Auth response:', { status: response.status, ok: response.ok })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ Auth successful:', userData)
        // Handle the wrapped response structure from NestJS
        const user = userData.data || userData
        setUser(user)
      } else {
        console.log('❌ Auth failed, removing token')
        localStorage.removeItem('admin_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('🔐 Attempting login for:', email)
      const response = await fetch('/api/admin/auth/login', {
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
      
      console.log('💾 Storing token:', { hasToken: !!token, tokenLength: token?.length })
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