import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفويض مطلوب', // Authorization token required
        code: 'NO_TOKEN'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    try {
      // Verify JWT token
      const payload = verifyToken(token)
      
      // Connect to database
      const db = await getDatabase()
      
      // Find user by ID
      const user = await db.collection('users').findOne({
        _id: new ObjectId(payload.userId),
        'status.isActive': true
      })

      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'المستخدم غير موجود أو غير نشط', // User not found or inactive
          code: 'USER_NOT_FOUND'
        }, { status: 404 })
      }

      // Update last activity
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            'security.lastActivity': new Date(),
            'updatedAt': new Date()
          }
        }
      )

      // Prepare user data
      const userData = {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        preferences: user.preferences,
        currentProgress: user.currentProgress,
        security: {
          emailVerified: user.security?.emailVerified || false,
          phoneVerified: user.security?.phoneVerified || false,
          twoFactorEnabled: user.security?.twoFactorEnabled || false
        },
        blockchain: {
          walletConnected: user.blockchain?.walletConnected || false,
          walletAddress: user.blockchain?.walletAddress,
          totalEarned: user.blockchain?.totalEarned || 0,
          totalWithdrawn: user.blockchain?.totalWithdrawn || 0,
          pendingRewards: user.blockchain?.pendingRewards || 0
        },
        status: {
          subscriptionType: user.status?.subscriptionType || 'free',
          registrationDate: user.status?.registrationDate,
          lastLoginDate: user.status?.lastLoginDate
        }
      }

      return NextResponse.json({
        success: true,
        data: userData
      })

    } catch (tokenError) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفويض غير صالح أو منتهي الصلاحية', // Invalid or expired token
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم', // Server error
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفويض مطلوب', // Authorization token required
        code: 'NO_TOKEN'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    try {
      // Verify JWT token
      const payload = verifyToken(token)
      
      // Connect to database
      const db = await getDatabase()
      
      // Build update object
      const updateFields: any = {
        'updatedAt': new Date()
      }

      // Update profile fields if provided
      if (body.profile) {
        if (body.profile.firstName) updateFields['profile.firstName'] = body.profile.firstName
        if (body.profile.lastName) updateFields['profile.lastName'] = body.profile.lastName
        if (body.profile.displayName) updateFields['profile.displayName'] = body.profile.displayName
        if (body.profile.dateOfBirth) updateFields['profile.dateOfBirth'] = new Date(body.profile.dateOfBirth)
        if (body.profile.gender) updateFields['profile.gender'] = body.profile.gender
        if (body.profile.country) updateFields['profile.country'] = body.profile.country
        if (body.profile.language) updateFields['profile.language'] = body.profile.language
        if (body.profile.timezone) updateFields['profile.timezone'] = body.profile.timezone
      }

      // Update preferences if provided
      if (body.preferences) {
        if (body.preferences.reciter) updateFields['preferences.reciter'] = body.preferences.reciter
        if (body.preferences.translation) updateFields['preferences.translation'] = body.preferences.translation
        if (body.preferences.fontSize) updateFields['preferences.fontSize'] = body.preferences.fontSize
        if (typeof body.preferences.nightMode === 'boolean') updateFields['preferences.nightMode'] = body.preferences.nightMode
        
        if (body.preferences.notifications) {
          Object.keys(body.preferences.notifications).forEach(key => {
            if (typeof body.preferences.notifications[key] === 'boolean') {
              updateFields[`preferences.notifications.${key}`] = body.preferences.notifications[key]
            }
          })
        }

        if (body.preferences.privacy) {
          Object.keys(body.preferences.privacy).forEach(key => {
            if (typeof body.preferences.privacy[key] === 'boolean') {
              updateFields[`preferences.privacy.${key}`] = body.preferences.privacy[key]
            }
          })
        }
      }

      // Update user
      const result = await db.collection('users').updateOne(
        { 
          _id: new ObjectId(payload.userId),
          'status.isActive': true
        },
        { $set: updateFields }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({
          success: false,
          message: 'المستخدم غير موجود', // User not found
          code: 'USER_NOT_FOUND'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح', // Profile updated successfully
        data: {
          updated: result.modifiedCount > 0
        }
      })

    } catch (tokenError) {
      return NextResponse.json({
        success: false,
        message: 'رمز التفويض غير صالح', // Invalid token
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم', // Server error
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}