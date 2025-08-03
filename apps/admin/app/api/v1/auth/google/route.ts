import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

interface GoogleAuthRequest {
  googleId: string
  email: string
  name: string
  picture?: string
  language?: string
  deviceInfo?: {
    type: string
    os: string
    version: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleAuthRequest = await request.json()
    const { googleId, email, name, picture, language = 'ar', deviceInfo } = body

    // Validate required fields from Google
    if (!googleId || !email || !name) {
      return NextResponse.json({
        success: false,
        message: 'بيانات Google غير مكتملة', // Incomplete Google data
        code: 'INVALID_GOOGLE_DATA'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()

    // Check if user already exists with this email
    let existingUser = await db.collection('users').findOne({
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    })

    if (existingUser) {
      // User exists, update Google info if needed and login
      if (!existingUser.googleId) {
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          {
            $set: {
              googleId: googleId,
              'profile.avatar': picture || existingUser.profile?.avatar,
              'security.emailVerified': true, // Google emails are verified
              'status.lastLoginDate': new Date(),
              'updatedAt': new Date()
            },
            $inc: {
              'status.loginCount': 1
            }
          }
        )
      } else {
        // Just update login info
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          {
            $set: {
              'status.lastLoginDate': new Date(),
              'updatedAt': new Date()
            },
            $inc: {
              'status.loginCount': 1
            }
          }
        )
      }

      // Generate JWT token
      const token = signToken({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        role: 'user'
      })

      // Log analytics event
      await db.collection('analytics_events').insertOne({
        userId: existingUser._id,
        eventType: 'user_login',
        eventData: {
          loginMethod: 'google',
          deviceType: deviceInfo?.type || 'unknown'
        },
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      })

      // Prepare user data
      const userData = {
        id: existingUser._id.toString(),
        email: existingUser.email,
        profile: existingUser.profile,
        stats: existingUser.stats,
        preferences: existingUser.preferences,
        currentProgress: existingUser.currentProgress,
        emailVerified: true
      }

      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح', // Successfully logged in
        data: {
          token,
          user: userData,
          isNewUser: false
        }
      })
    }

    // Create new user with Google OAuth
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    const newUser = {
      email: email.toLowerCase(),
      password: null, // No password for Google OAuth users
      googleId: googleId,
      profile: {
        firstName,
        lastName,
        displayName: name,
        avatar: picture || null,
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
        emailVerified: true, // Google emails are verified
        phoneNumber: null,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastPasswordChange: null
      },
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null,
        lastLoginDate: new Date(),
        loginCount: 1,
        registrationDate: new Date(),
        subscriptionType: 'free'
      },
      deviceInfo: deviceInfo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert new user
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

    // Log analytics event
    await db.collection('analytics_events').insertOne({
      userId: result.insertedId,
      eventType: 'user_registered',
      eventData: {
        registrationMethod: 'google',
        language: language,
        deviceType: deviceInfo?.type || 'unknown'
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    })

    // Prepare user data
    const userData = {
      id: result.insertedId.toString(),
      email: newUser.email,
      profile: newUser.profile,
      stats: newUser.stats,
      preferences: newUser.preferences,
      currentProgress: newUser.currentProgress,
      emailVerified: true
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح', // Account created successfully
      data: {
        token,
        user: userData,
        isNewUser: true
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في تسجيل الدخول بـ Google', // Google login error
      code: 'GOOGLE_AUTH_ERROR'
    }, { status: 500 })
  }
}