'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@quranreciter.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
    } catch (error) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Brand color geometric lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5955DD" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#F149FE" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            {/* Geometric lines pattern */}
            <path d="M0,100 L300,0 L600,150 L900,50 L1200,200" stroke="url(#brandGradient)" strokeWidth="2" fill="none"/>
            <path d="M0,300 L400,200 L800,350 L1200,250" stroke="url(#brandGradient)" strokeWidth="1.5" fill="none"/>
            <path d="M200,0 L500,250 L800,100 L1200,300" stroke="url(#brandGradient)" strokeWidth="1" fill="none"/>
            <path d="M0,500 L300,400 L600,550 L900,450 L1200,600" stroke="url(#brandGradient)" strokeWidth="2" fill="none"/>
            <path d="M100,700 L400,600 L700,750 L1000,650 L1200,800" stroke="url(#brandGradient)" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        
        {/* Subtle ping accents */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 gradient-primary-soft rounded-full blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 gradient-secondary-soft rounded-full blur-3xl opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Islamic geometric patterns */}
        <div className="absolute top-20 right-20 opacity-5">
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="#5955DD">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
            </g>
          </svg>
        </div>
        
        <div className="absolute bottom-20 left-20 opacity-5">
          <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#F149FE" strokeWidth="1">
              <rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)"/>
              <rect x="30" y="30" width="20" height="20" transform="rotate(45 40 40)"/>
            </g>
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="w-full shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl p-3">
                <img 
                  src="/reciter-logo.svg" 
                  alt="Quran Reciter Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to access the Quran Reciter management dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@quranreciter.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base transition-all duration-200 border-2 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base transition-all duration-200 border-2 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold gradient-dual hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                Having trouble? Contact your system administrator
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}