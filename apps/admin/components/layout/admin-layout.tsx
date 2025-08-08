'use client'

import React from 'react'
import { AdminHeader } from './admin-header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#F5F5F5'}}>
      <AdminHeader />
      <main className="p-6 min-h-screen" style={{backgroundColor: '#F5F5F5'}}>
        {children}
      </main>
    </div>
  )
}