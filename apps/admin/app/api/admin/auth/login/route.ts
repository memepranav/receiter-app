import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Find admin user by email
    const admin = await db.collection('admins').findOne({
      email: email.toLowerCase(),
      'status.isActive': true
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await db.collection('admins').updateOne(
        { _id: admin._id },
        {
          $inc: { 'security.failedLoginAttempts': 1 },
          $set: { 'updatedAt': new Date() }
        }
      )

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Reset failed login attempts and update last login
    await db.collection('admins').updateOne(
      { _id: admin._id },
      {
        $set: {
          'security.failedLoginAttempts': 0,
          'security.lastLoginDate': new Date(),
          'security.lastLoginIP': request.headers.get('x-forwarded-for') || 
                                 request.headers.get('x-real-ip') || 
                                 'unknown',
          'updatedAt': new Date()
        }
      }
    )

    // Generate JWT token
    const token = signToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role
    })

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.profile?.displayName || `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 'Admin User',
      role: admin.role,
      permissions: admin.permissions
    }

    return NextResponse.json({
      success: true,
      token,
      user: userData
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}