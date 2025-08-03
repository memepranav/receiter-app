'use client'

import React from 'react'
import { AdminHeader } from './admin-header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="p-6 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}