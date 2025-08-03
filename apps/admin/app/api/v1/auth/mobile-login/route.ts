import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

interface MobileLoginRequest {
  email: string
  password: string
  deviceInfo: {
    deviceId: string
    deviceName: string
    deviceType: 'phone' | 'tablet'
    platform: 'ios' | 'android'
    platformVersion: string
    appVersion: string
    pushToken?: string
  }
  biometricLogin?: boolean
  rememberDevice?: boolean
  location?: {
    latitude: number
    longitude: number
    country?: string
    city?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MobileLoginRequest = await request.json()
    const { 
      email, 
      password, 
      deviceInfo, 
      biometricLogin = false,
      rememberDevice = false,
      location 
    } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 })
    }

    // Validate device info for mobile
    if (!deviceInfo || !deviceInfo.deviceId || !deviceInfo.platform) {
      return NextResponse.json({
        success: false,
        message: 'معلومات الجهاز مطلوبة للتطبيق المحمول',
        code: 'MISSING_DEVICE_INFO'
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
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Check if user registered with Google (no password)
    if (!user.password && user.googleId) {
      return NextResponse.json({
        success: false,
        message: 'يرجى تسجيل الدخول باستخدام Google',
        code: 'USE_GOOGLE_LOGIN'
      }, { status: 400 })
    }

    // Check account status
    if (user.status?.isSuspended) {
      return NextResponse.json({
        success: false,
        message: 'تم إيقاف حسابك. يرجى التواصل مع الدعم',
        code: 'ACCOUNT_SUSPENDED'
      }, { status: 403 })
    }

    // Check for too many failed login attempts
    const maxFailedAttempts = 5
    const lockoutDuration = 15 * 60 * 1000 // 15 minutes
    
    if (user.security?.failedLoginAttempts >= maxFailedAttempts) {
      const lastFailedAttempt = user.security?.lastFailedLoginAttempt
      if (lastFailedAttempt && (new Date().getTime() - lastFailedAttempt.getTime()) < lockoutDuration) {
        return NextResponse.json({
          success: false,
          message: 'تم قفل الحساب مؤقتاً بسبب محاولات دخول خاطئة متعددة',
          code: 'ACCOUNT_LOCKED',
          data: {
            lockoutExpiresAt: new Date(lastFailedAttempt.getTime() + lockoutDuration)
          }
        }, { status: 429 })
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Log failed login attempt
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $inc: { 'security.failedLoginAttempts': 1 },
          $set: { 
            'security.lastFailedLoginAttempt': new Date(),
            'updatedAt': new Date() 
          }
        }
      )

      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Check if device is new or needs verification
    const existingDevice = user.devices?.find(
      (device: any) => device.deviceId === deviceInfo.deviceId
    )

    const isNewDevice = !existingDevice
    const deviceNeedsVerification = isNewDevice && !rememberDevice

    // Prepare device data
    const deviceData = {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      platform: deviceInfo.platform,
      platformVersion: deviceInfo.platformVersion,
      appVersion: deviceInfo.appVersion,
      pushToken: deviceInfo.pushToken,
      firstLoginDate: existingDevice?.firstLoginDate || new Date(),
      lastLoginDate: new Date(),
      isActive: true,
      isTrusted: existingDevice?.isTrusted || rememberDevice,
      location: location || existingDevice?.location,
      biometricEnabled: biometricLogin || existingDevice?.biometricEnabled || false
    }

    // Update user login info and device data
    const updateData: any = {
      $set: {
        'security.failedLoginAttempts': 0,
        'security.lastActivity': new Date(),
        'status.lastLoginDate': new Date(),
        'updatedAt': new Date()
      },
      $inc: {
        'status.loginCount': 1
      }
    }

    // Update or add device
    if (existingDevice) {
      updateData.$set[`devices.$[device]`] = deviceData
    } else {
      updateData.$push = { devices: deviceData }
    }

    const updateOptions = existingDevice ? {
      arrayFilters: [{ 'device.deviceId': deviceInfo.deviceId }]
    } : {}

    await db.collection('users').updateOne(
      { _id: user._id },
      updateData,
      updateOptions
    )

    // Generate JWT token with device info
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: 'user',
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform
    }

    const token = signToken(tokenPayload)

    // Log analytics event
    await db.collection('analytics_events').insertOne({
      userId: user._id,
      eventType: 'mobile_login',
      eventData: {
        loginMethod: biometricLogin ? 'biometric' : 'password',
        platform: deviceInfo.platform,
        deviceType: deviceInfo.deviceType,
        appVersion: deviceInfo.appVersion,
        isNewDevice,
        location: location ? {
          country: location.country,
          city: location.city
        } : null
      },
      timestamp: new Date(),
      sessionId: null,
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      deviceId: deviceInfo.deviceId
    })

    // Prepare user data for response
    const userData = {
      id: user._id.toString(),
      email: user.email,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        displayName: user.profile?.displayName,
        avatar: user.profile?.avatar,
        language: user.profile?.language || 'ar'
      },
      stats: user.stats || {
        totalReadingTime: 0,
        completedJuz: 0,
        completedSurahs: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        rank: 0
      },
      preferences: user.preferences || {
        reciter: null,
        translation: 'arabic',
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
      currentProgress: user.currentProgress || {
        currentJuz: 1,
        currentHizb: 1,
        currentRub: 1,
        currentSurah: 1,
        currentAyah: 1,
        lastReadDate: null
      },
      security: {
        emailVerified: user.security?.emailVerified || false,
        phoneVerified: user.security?.phoneVerified || false,
        twoFactorEnabled: user.security?.twoFactorEnabled || false,
        biometricEnabled: biometricLogin
      },
      blockchain: {
        walletConnected: user.blockchain?.walletConnected || false,
        walletAddress: user.blockchain?.walletAddress,
        totalEarned: user.blockchain?.totalEarned || 0,
        totalWithdrawn: user.blockchain?.totalWithdrawn || 0,
        pendingRewards: user.blockchain?.pendingRewards || 0
      },
      subscription: {
        type: user.status?.subscriptionType || 'free',
        expiresAt: user.subscription?.expiresAt || null
      },
      deviceInfo: {
        isNewDevice,
        deviceTrusted: deviceData.isTrusted,
        biometricAvailable: biometricLogin
      }
    }

    const responseData = {
      token,
      user: userData,
      session: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        deviceRegistered: !isNewDevice,
        requiresDeviceVerification: deviceNeedsVerification
      }
    }

    // If it's a new device and user hasn't opted to remember it, require verification
    if (deviceNeedsVerification) {
      // In a real app, you'd send SMS/email verification here
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح. يتطلب التحقق من الجهاز الجديد',
        data: {
          ...responseData,
          requiresVerification: true,
          verificationMethod: 'sms' // or 'email'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: responseData
    })

  } catch (error) {
    console.error('Mobile login error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Get device info for current session
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفويض مطلوب',
        code: 'NO_TOKEN'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // This would need JWT verification logic
    // For now, return basic device management info
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Device info endpoint - implement JWT verification'
      }
    })

  } catch (error) {
    console.error('Device info error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}