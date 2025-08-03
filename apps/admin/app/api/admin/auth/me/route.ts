import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      // Verify JWT token
      const payload = verifyToken(token)
      
      // Connect to database
      const db = await getDatabase()
      
      // Find admin user by ID
      const admin = await db.collection('admins').findOne({
        _id: new ObjectId(payload.userId),
        'status.isActive': true
      })

      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'User not found or inactive' },
          { status: 401 }
        )
      }

      // Update last activity
      await db.collection('admins').updateOne(
        { _id: admin._id },
        {
          $set: {
            'security.lastActivity': new Date(),
            'updatedAt': new Date()
          }
        }
      )

      // Return user data (exclude sensitive information)
      const userData = {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.profile?.displayName || `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 'Admin User',
        role: admin.role,
        permissions: admin.permissions,
        lastLoginDate: admin.security?.lastLoginDate,
        avatar: admin.profile?.avatar
      }

      return NextResponse.json({
        success: true,
        ...userData
      })

    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}