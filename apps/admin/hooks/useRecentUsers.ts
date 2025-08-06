import { useState, useEffect } from 'react'
import { apiClient, unwrapApiResponse } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive' | 'suspended'
  points: number
  juzCompleted: number
  country: string
  authProvider: string
  isEmailVerified: boolean
  lastLoginAt: string | null
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  totalPoints: number
}

interface RecentUsersResponse {
  users: User[]
  stats: UserStats
}

export function useRecentUsers(limit: number = 10) {
  const [data, setData] = useState<RecentUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('limit', limit.toString())

      const result = await apiClient.get('/api/admin/users/recent', params)
      const data = unwrapApiResponse(result)
      setData(data)
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
      console.error('Error fetching recent users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentUsers()
  }, [limit])

  return {
    data,
    loading,
    error,
    refetch: fetchRecentUsers
  }
}