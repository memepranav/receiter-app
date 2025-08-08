'use client'

import React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  BarChart3, 
  Coins,
  ArrowRight,
  Loader2,
  Eye,
  Edit
} from 'lucide-react'
import { useRecentUsers } from '@/hooks/useRecentUsers'

export default function DashboardPage() {
  // Fetch recent users data
  const { data, loading, error } = useRecentUsers(10)

  // Create action cards with real data
  const actionCards = [
    {
      icon: Users,
      title: 'User Management',
      subtitle: 'Manage registered users',
      value: data?.stats.totalUsers?.toLocaleString() || '0',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-800',
      buttonText: 'View Users',
      href: '/users'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      subtitle: 'View detailed statistics',
      value: data?.stats.activeUsers ? `${Math.round((data.stats.activeUsers / data.stats.totalUsers) * 100)}% Active` : '0% Active',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      buttonText: 'View Analytics',
      href: '/analytics'
    },
    {
      icon: Coins,
      title: 'Rewards Processing',
      subtitle: 'Total points distributed',
      value: data?.stats.totalPoints ? `${Math.round(data.stats.totalPoints / 1000)}K Points` : '0 Points',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
      buttonText: 'View Rewards',
      href: '/rewards'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-600">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-slate-600">Loading dashboard...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex-1">
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Welcome, Admin User</h1>
                <p className="text-sm text-slate-600">Dashboard overview of your Quran Reciter platform</p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actionCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <Card key={index} className={`p-6 ${card.bgColor} border-0 relative overflow-hidden`}>
                      <div className={`${card.textColor}`}>
                        <div className="flex items-center justify-between mb-4">
                          <Icon className="h-8 w-8" />
                          <ArrowRight className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">{card.title}</h3>
                          <p className="text-sm opacity-90">{card.subtitle}</p>
                          <p className="text-lg font-bold">{card.value}</p>
                        </div>
                        <Link href={card.href}>
                          <Button 
                            className="mt-4 bg-primary hover:bg-primary-hover text-white"
                            size="sm"
                          >
                            {card.buttonText}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recently Signed Up Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Recently Signed Up Users</h3>
                <p className="text-sm text-slate-600">Latest {data?.users.length || 0} users who joined the platform</p>
              </div>
            </div>

            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error: {error}</p>
              </div>
            ) : data?.users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No users found.</p>
              </div>
            ) : (
              <>
                {/* Users Table */}
                <div className="overflow-x-auto mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-800">User</TableHead>
                        <TableHead className="font-semibold text-slate-800">Contact</TableHead>
                        <TableHead className="font-semibold text-slate-800">Status</TableHead>
                        <TableHead className="font-semibold text-slate-800">Progress</TableHead>
                        <TableHead className="font-semibold text-slate-800">Points</TableHead>
                        <TableHead className="font-semibold text-slate-800">Join Date</TableHead>
                        <TableHead className="font-semibold text-slate-800">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{user.name}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  {user.country}
                                  {user.authProvider === 'google' && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Google</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-slate-800 flex items-center gap-1">
                                {user.email}
                                {user.isEmailVerified && (
                                  <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">✓</span>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">{user.phone || 'No phone'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {user.juzCompleted}/30 Juz
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${Math.min((user.juzCompleted / 30) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-800">
                              {user.points.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">{user.joinDate}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Edit User">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* View All Users Button */}
                <div className="flex justify-center">
                  <Link href="/users">
                    <Button className="bg-primary hover:bg-primary-hover text-white">
                      View All Users ({data?.stats.totalUsers.toLocaleString()})
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}