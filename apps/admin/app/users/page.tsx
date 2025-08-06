'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  BarChart3, 
  Coins, 
  BookOpen, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronDown,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'

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

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Fetch users data from MongoDB
  const { data, loading, error, refetch } = useUsers({ 
    search: searchTerm, 
    status: statusFilter 
  })

  // Handle search
  const handleSearch = () => {
    refetch()
  }

  // Debug logging
  React.useEffect(() => {
    if (data) {
      console.log('🔍 Users Page - Data structure:', data)
      console.log('🔍 Users Page - Data keys:', Object.keys(data))
      console.log('🔍 Users Page - Stats:', data?.stats)
    }
  }, [data])

  // Format stats cards with real data
  const statsCards = [
    {
      icon: Users,
      title: 'Total Users',
      value: data?.stats?.totalUsers?.toLocaleString() || data?.pagination?.total?.toLocaleString() || '0',
      change: '+12%',
      bgColor: 'bg-slate-200',
      textColor: 'text-slate-800'
    },
    {
      icon: BarChart3,
      title: 'Active Users',
      value: data?.stats?.activeUsers?.toLocaleString() || '0',
      change: '+8%',
      bgColor: 'gradient-primary',
      textColor: 'text-white'
    },
    {
      icon: Coins,
      title: 'Total Points',
      value: data?.stats?.totalPoints ? `${Math.round(data.stats.totalPoints / 1000)}K` : '0',
      change: '+23%',
      bgColor: 'gradient-secondary',
      textColor: 'text-white'
    }
  ]

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-slate-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-sm text-slate-600">Manage and monitor all Quran Reciter app users</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {statsCards.map((card, index) => {
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
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-sm opacity-90">{card.change} from last month</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* User Search and Filters */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Search Users</h3>
            <div className="flex items-center space-x-2">
              <Button className="bg-primary hover:bg-primary-hover text-white" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-primary hover:bg-primary-hover text-white" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-600 block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 block mb-2">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 block mb-2">Country</label>
              <div className="flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2">
                <span className="text-sm text-slate-500">All Countries</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 block mb-2">Action</label>
              <Button 
                onClick={handleSearch} 
                className="w-full bg-primary hover:bg-primary-hover text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Search Users
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Users List ({data?.pagination.total || 0} total)
            </h3>
            <div className="text-sm text-slate-600">
              Showing {Math.min(data?.users?.length || 0, data?.pagination.total || 0)} of {data?.pagination.total || 0} users
            </div>
          </div>

          <div className="overflow-x-auto">
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
                {data?.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-slate-500">
                        {searchTerm || statusFilter !== 'all' ? 'No users found matching your search.' : 'No users found.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.users.map((user) => (
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
                        {user.lastLoginAt && (
                          <div className="text-xs text-slate-500">
                            Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit User">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="More Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Loading overlay for table refresh */}
          {loading && data && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}