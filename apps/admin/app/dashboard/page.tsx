'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BarChart3, 
  Coins,
  ArrowRight,
  ChevronDown
} from 'lucide-react'


export default function DashboardPage() {

  const actionCards = [
    {
      icon: Users,
      title: 'User Management',
      subtitle: 'Manage registered users',
      value: '2,543 Users',
      bgColor: 'gradient-primary-soft',
      textColor: 'text-slate-800',
      buttonText: 'View Users'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      subtitle: 'View detailed statistics',
      value: '89% Active',
      bgColor: 'gradient-primary',
      textColor: 'text-white',
      buttonText: 'View Analytics'
    },
    {
      icon: Coins,
      title: 'Rewards Processing',
      subtitle: 'Process pending rewards',
      value: '456 Pending',
      bgColor: 'gradient-secondary',
      textColor: 'text-white',
      buttonText: 'Process Now'
    }
  ]


  return (
    <ProtectedRoute>
      <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex-1">
          <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-800">Welcome, Admin User</h1>
              <p className="text-sm text-slate-600">Last logged in at 09:45 AM</p>
            </div>



            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <Card key={index} className={`p-6 ${card.bgColor} border-0 relative overflow-hidden gradient-card`}>
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
                      <Button 
                        className="mt-4 bg-primary hover:bg-primary-hover text-white"
                        size="sm"
                      >
                        {card.buttonText}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

        </div>

        {/* User Management Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
              <p className="text-sm text-slate-600">Manage and monitor all Quran Reciter app users</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-slate-300">
                Filter
              </Button>
              <Button variant="outline" className="border-slate-300">
                Export
              </Button>
              <Button className="bg-primary hover:bg-primary-hover text-white">
                Add New User
              </Button>
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm text-slate-600 block mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-2">Country</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>All Countries</option>
                <option>Saudi Arabia</option>
                <option>Egypt</option>
                <option>UAE</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-2">Action</label>
              <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                Search Users
              </Button>
            </div>
          </div>

          {/* Table Header */}
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-md font-semibold text-slate-800">Users List</h4>
            <span className="text-sm text-slate-600">Showing 1-10 of 2,543 total</span>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Contact</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Progress</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Points</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Join Date</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">AH</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Ahmed Hassan</p>
                        <p className="text-sm text-slate-500">ID: #12345</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <p className="text-sm text-slate-800">ahmed.hassan@email.com</p>
                    <p className="text-sm text-slate-500">+966 123 456 789</p>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-700">15/30 Juz</span>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: '50%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium text-slate-800">1,250</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-slate-600">Jan 15, 2024</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">FA</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Fatima Ali</p>
                        <p className="text-sm text-slate-500">ID: #12346</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <p className="text-sm text-slate-800">fatima.ali@email.com</p>
                    <p className="text-sm text-slate-500">+971 987 654 321</p>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-700">8/30 Juz</span>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: '27%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium text-slate-800">850</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-slate-600">Feb 3, 2024</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">MK</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Mohamed Khalil</p>
                        <p className="text-sm text-slate-500">ID: #12347</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <p className="text-sm text-slate-800">mohamed.khalil@email.com</p>
                    <p className="text-sm text-slate-500">+20 111 222 333</p>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-700">22/30 Juz</span>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: '73%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium text-slate-800">2,180</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-slate-600">Dec 20, 2023</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Inactive
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-slate-600">Showing 1 to 3 of 2,543 results</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span className="text-slate-500">...</span>
              <Button variant="outline" size="sm">
                254
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
    </ProtectedRoute>
  )
}