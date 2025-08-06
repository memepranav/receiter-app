import { useState, useEffect } from 'react'

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
      params.append('skip', skip.toString())

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Network error occurred')
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