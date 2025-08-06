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
    <header className="bg-slate-800 text-white">
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
              className="flex items-center space-x-2 bg-slate-700 rounded-full px-3 py-2 hover:bg-slate-600 transition-colors"
            >
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-700" />
              </div>
              <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-600/50 z-50 overflow-hidden">
                {/* Header Section with User Name */}
                <div className="px-6 py-4 border-b border-slate-600/50">
                  <div className="text-white text-lg font-medium">{user?.name || 'Admin User'}</div>
                </div>

                {/* Menu Items */}
                <div className="py-3">
                  <button className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <User className="h-5 w-5 text-white/70" />
                    <span className="text-base">My Profile</span>
                  </button>

                  <button className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-base">Admin Services</span>
                  </button>

                  <button className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-base">Change Password</span>
                  </button>

                  <button className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    <span className="text-base">Switch to Mobile View</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-6 py-3 text-white/90 hover:text-white hover:bg-slate-700/50 transition-colors"
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