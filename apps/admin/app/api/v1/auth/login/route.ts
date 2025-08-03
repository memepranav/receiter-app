import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

interface LoginRequest {
  email: string
  password: string
  deviceInfo?: {
    type: string
    os: string
    version: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, deviceInfo } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان', // Email and password are required
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()

    // Find user by email
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      'status.isActive': true
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', // Incorrect email or password
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Check if user registered with Google (no password)
    if (!user.password && user.googleId) {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول باستخدام Google', // Please login with Google
        code: 'USE_GOOGLE_LOGIN'
      }, { status: 400 })
    }

    // Check if account is suspended
    if (user.status?.isSuspended) {
      return NextResponse.json({
        success: false,
        message: 'تم إيقاف حسابك. يرجى التواصل مع الدعم', // Account suspended. Please contact support
        code: 'ACCOUNT_SUSPENDED'
      }, { status: 403 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Log failed login attempt
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $inc: { 'security.failedLoginAttempts': 1 },
          $set: { 'updatedAt': new Date() }
        }
      )

      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', // Incorrect email or password
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Reset failed login attempts and update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          'security.failedLoginAttempts': 0,
          'status.lastLoginDate': new Date(),
          'updatedAt': new Date()
        },
        $inc: {
          'status.loginCount': 1
        }
      }
    )

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: 'user'
    })

    // Log analytics event
    await db.collection('analytics_events').insertOne({
      userId: user._id,
      eventType: 'user_login',
      eventData: {
        loginMethod: 'email',
        deviceType: deviceInfo?.type || 'unknown'
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    })

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        displayName: user.profile?.displayName,
        avatar: user.profile?.avatar,
        language: user.profile?.language
      },
      stats: user.stats,
      preferences: user.preferences,
      currentProgress: user.currentProgress,
      emailVerified: user.security?.emailVerified || false,
      blockchain: {
        walletConnected: user.blockchain?.walletConnected || false,
        totalEarned: user.blockchain?.totalEarned || 0,
        pendingRewards: user.blockchain?.pendingRewards || 0
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح', // Successfully logged in
      data: {
        token,
        user: userData
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم', // Server error
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}