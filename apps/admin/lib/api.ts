// API utility for authenticated requests
export class ApiClient {
  private baseUrl: string
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token')
    
    // Debug logging
    console.log('🔑 API Client Debug:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 50) || 'No token',
      authHeader: token ? 'Bearer ' + token.substring(0, 20) + '...' : 'No header'
    })
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async get(endpoint: string, params?: URLSearchParams): Promise<any> {
    const url = params ? `${this.baseUrl}${endpoint}?${params.toString()}` : `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async put(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

// Get API base URL from environment variables (same pattern as auth-context)
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_API_URL from .env.local or fallback
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || ''
  }
  // Server-side: use API_BASE_URL or empty string (for relative URLs on server)
  return process.env.API_BASE_URL || ''
}

// Create a default instance
export const apiClient = new ApiClient(getApiBaseUrl())

// Helper function for handling API responses (NestJS returns wrapped responses)
export function unwrapApiResponse(response: any): any {
  if (response && response.data !== undefined) {
    return response.data
  }
  return response
}