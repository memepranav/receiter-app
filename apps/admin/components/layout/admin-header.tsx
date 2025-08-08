'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClickOutside } from '@/hooks/useClickOutside'

export function AdminHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
  // Close dropdown when clicking outside or pressing Escape
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setShowUserMenu(false), showUserMenu)

  return (
    <header className="text-white" style={{backgroundColor: '#1e2a3b'}}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
            <img 
              src="/reciter-logo.svg" 
              alt="Quran Reciter Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold text-white">Quran Reciter Admin</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-8">
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/users" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/users' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Users
          </Link>
          <Link 
            href="/analytics" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/analytics' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Analytics
          </Link>
          <div className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white cursor-pointer">
            <span>Rewards</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <Link 
            href="/content" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/content' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Content
          </Link>
          <Link 
            href="/reports" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/reports' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Reports
          </Link>
          <Link 
            href="/settings" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/settings' ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Settings
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Admin Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-full px-3 py-2 hover:bg-black/20 transition-colors"
              style={{backgroundColor: 'rgba(0,0,0,0.1)'}}
            >
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-700" />
              </div>
              <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden" style={{backgroundColor: 'rgba(30, 42, 59, 0.95)'}}>
                {/* Header Section with User Name */}
                <div className="px-6 py-4 border-b border-white/20">
                  <div className="text-white text-lg font-medium">{user?.name || 'Admin User'}</div>
                </div>

                {/* Menu Items */}
                <div className="py-3">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-black/20 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-5 w-5 text-white/70" />
                    <span className="text-base">My Profile</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-black/20 transition-colors"
                  >
                    <LogOut className="h-5 w-5 text-white/70" />
                    <span className="text-base">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}