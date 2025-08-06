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

interface UsersResponse {
  users: User[]
  pagination: {
    total: number
    limit: number
    skip: number
    hasMore: boolean
  }
  stats: UserStats
}

interface UseUsersParams {
  search?: string
  status?: string
  limit?: number
  skip?: number
}

export function useUsers({ search = '', status = 'all', limit = 50, skip = 0 }: UseUsersParams = {}) {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status !== 'all') params.append('status', status)
      params.append('limit', limit.toString())
      // Convert skip to page number (skip = (page - 1) * limit, so page = skip / limit + 1)
      const page = Math.floor(skip / limit) + 1
      params.append('page', page.toString())

      const result = await apiClient.get('/api/admin/users', params)
      const data = unwrapApiResponse(result)
      console.log('🔍 API Response Structure:', JSON.stringify(data, null, 2))
      console.log('🔍 Data keys:', Object.keys(data || {}))
      console.log('🔍 Stats object:', data?.stats)
      setData(data)
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, status, limit, skip])

  return {
    data,
    loading,
    error,
    refetch: fetchUsers
  }
}