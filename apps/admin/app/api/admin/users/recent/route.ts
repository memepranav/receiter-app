import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    const db = await getDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch recent users from the database
    const recentUsers = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .limit(limit)
      .toArray()

    // Get basic stats
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

    // Format recent users data
    const formattedUsers = recentUsers.map(user => ({
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
        stats: {
          totalUsers: stats[0],
          activeUsers: stats[1], 
          totalPoints: totalPoints
        }
      }
    })

  } catch (error) {
    console.error('Recent users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent users' },
      { status: 500 }
    )
  }
}