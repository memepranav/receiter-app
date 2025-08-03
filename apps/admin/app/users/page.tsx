'use client'

import React from 'react'
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
  ArrowRight
} from 'lucide-react'


const statsCards = [
  {
    icon: Users,
    title: 'Total Users',
    value: '2,543',
    change: '+12%',
    bgColor: 'bg-slate-200',
    textColor: 'text-slate-800'
  },
  {
    icon: BarChart3,
    title: 'Active Users',
    value: '1,834',
    change: '+8%',
    bgColor: 'gradient-primary',
    textColor: 'text-white'
  },
  {
    icon: Coins,
    title: 'Total Points',
    value: '456K',
    change: '+23%',
    bgColor: 'gradient-secondary',
    textColor: 'text-white'
  }
]

const users = [
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    joinDate: '2024-01-15',
    status: 'active',
    points: 2450,
    juzCompleted: 8,
    country: 'Saudi Arabia'
  },
  {
    id: 2,
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '+966507654321',
    joinDate: '2024-02-20',
    status: 'active',
    points: 3750,
    juzCompleted: 12,
    country: 'UAE'
  },
  {
    id: 3,
    name: 'محمد حسن',
    email: 'mohammed@example.com',
    phone: '+966508765432',
    joinDate: '2024-01-10',
    status: 'inactive',
    points: 1200,
    juzCompleted: 3,
    country: 'Kuwait'
  },
  {
    id: 4,
    name: 'عائشة أحمد',
    email: 'aisha@example.com',
    phone: '+966509876543',
    joinDate: '2024-03-05',
    status: 'active',
    points: 1890,
    juzCompleted: 5,
    country: 'Egypt'
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

export default function UsersPage() {
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
              <Button className="bg-primary hover:bg-primary-hover text-white">
                Add New User
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
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 block mb-2">Status</label>
              <div className="flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2">
                <span className="text-sm text-slate-500">All Status</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
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
              <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                Search Users
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Users List ({users.length} total)</h3>
            <div className="text-sm text-slate-600">
              Showing 1-{users.length} of {users.length} users
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
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.country}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-slate-800">{user.email}</div>
                        <div className="text-sm text-slate-500">{user.phone}</div>
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
                            style={{ width: `${(user.juzCompleted / 30) * 100}%` }}
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}