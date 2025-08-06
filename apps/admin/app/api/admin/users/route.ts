import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    const db = await getDatabase()
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Build query filters
    const query: any = {}
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true
      } else if (status === 'inactive') {
        query.isActive = false
      }
    }

    // Fetch users from the database
    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    // Get total count for pagination
    const totalUsers = await db.collection('users').countDocuments(query)
    
    // Get stats for summary cards
    const stats = await Promise.all([
      // Total users
      db.collection('users').countDocuments({}),
      // Active users
      db.collection('users').countDocuments({ isActive: true }),
      // Total points across all users
      db.collection('users').aggregate([
        { $group: { _id: null, totalPoints: { $sum: "$points" } } }
      ]).toArray()
    ])

    const totalPoints = stats[2][0]?.totalPoints || 0

    // Format users data
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown User',
      email: user.email || '',
      phone: user.phoneNumber || user.phone || '',
      joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'Unknown',
      status: user.isActive ? 'active' : 'inactive',
      points: user.points || 0,
      juzCompleted: user.readingProgress?.juzCompleted || 0,
      country: user.profile?.country || user.country || 'Unknown',
      authProvider: user.authProvider || 'local',
      isEmailVerified: user.isEmailVerified || false,
      lastLoginAt: user.lastLoginAt || null
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: totalUsers,
          limit,
          skip,
          hasMore: skip + limit < totalUsers
        },
        stats: {
          totalUsers: stats[0],
          activeUsers: stats[1], 
          totalPoints: totalPoints
        }
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}