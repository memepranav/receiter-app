import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

interface RegisterRequest {
  fullName: string
  email: string
  password: string
  agreeToTerms: boolean
  language?: string
  deviceInfo?: {
    type: string
    os: string
    version: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { fullName, email, password, agreeToTerms, language = 'ar', deviceInfo } = body

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'الاسم الكامل والبريد الإلكتروني وكلمة المرور مطلوبة', // Full name, email and password are required
        code: 'MISSING_FIELDS'
      }, { status: 400 })
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return NextResponse.json({
        success: false,
        message: 'يجب الموافقة على الشروط وسياسة الخصوصية', // Must agree to terms and privacy policy
        code: 'TERMS_NOT_AGREED'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'تنسيق البريد الإلكتروني غير صحيح', // Invalid email format
        code: 'INVALID_EMAIL'
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل', // Password must be at least 6 characters
        code: 'WEAK_PASSWORD'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل', // Email already exists
        code: 'EMAIL_EXISTS'
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Split full name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create user object
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        displayName: fullName,
        avatar: null,
        dateOfBirth: null,
        gender: 'not_specified',
        country: null,
        language: language,
        timezone: null
      },
      preferences: {
        reciter: null,
        translation: language === 'ar' ? 'arabic' : 'english',
        fontSize: 16,
        nightMode: false,
        notifications: {
          dailyReminder: true,
          weeklyProgress: true,
          achievements: true,
          rewards: true
        },
        privacy: {
          showProgressToOthers: true,
          allowFriendRequests: true
        }
      },
      stats: {
        totalReadingTime: 0,
        completedJuz: 0,
        completedSurahs: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        rank: 0
      },
      blockchain: {
        walletAddress: null,
        walletConnected: false,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingRewards: 0
      },
      currentProgress: {
        currentJuz: 1,
        currentHizb: 1,
        currentRub: 1,
        currentSurah: 1,
        currentAyah: 1,
        lastReadDate: null
      },
      security: {
        emailVerified: false,
        phoneNumber: null,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastPasswordChange: new Date()
      },
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null,
        lastLoginDate: null,
        loginCount: 0,
        registrationDate: new Date(),
        subscriptionType: 'free'
      },
      deviceInfo: deviceInfo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert user into database
    const result = await db.collection('users').insertOne(newUser)

    if (!result.insertedId) {
      return NextResponse.json({
        success: false,
        message: 'فشل في إنشاء الحساب', // Failed to create account
        code: 'REGISTRATION_FAILED'
      }, { status: 500 })
    }

    // Generate JWT token
    const token = signToken({
      userId: result.insertedId.toString(),
      email: newUser.email,
      role: 'user'
    })

    // Prepare user data for response (exclude sensitive info)
    const userData = {
      id: result.insertedId.toString(),
      email: newUser.email,
      profile: {
        firstName: newUser.profile.firstName,
        lastName: newUser.profile.lastName,
        displayName: newUser.profile.displayName,
        avatar: newUser.profile.avatar
      },
      stats: newUser.stats,
      preferences: newUser.preferences,
      currentProgress: newUser.currentProgress,
      emailVerified: newUser.security.emailVerified
    }

    // Log analytics event
    await db.collection('analytics_events').insertOne({
      userId: result.insertedId,
      eventType: 'user_registered',
      eventData: {
        registrationMethod: 'email',
        language: language,
        deviceType: deviceInfo?.type || 'unknown'
      },
      timestamp: new Date(),
      sessionId: null,
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح', // Account created successfully
      data: {
        token,
        user: userData,
        needsEmailVerification: true
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم', // Server error
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}