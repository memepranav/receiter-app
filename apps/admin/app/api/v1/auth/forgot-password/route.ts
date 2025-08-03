import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import crypto from 'crypto'

interface ForgotPasswordRequest {
  email: string
  language?: string
  deviceInfo?: {
    type: string
    platform: string
    userAgent: string
  }
}

// Email service function (in a real app, you'd use SendGrid, SES, etc.)
async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  userName: string, 
  language: string = 'ar'
) {
  // In production, replace this with actual email service
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
  
  console.log('=== PASSWORD RESET EMAIL ===')
  console.log('To:', email)
  console.log('Reset Link:', resetLink)
  console.log('Language:', language)
  console.log('User:', userName)
  console.log('==========================')
  
  // TODO: Implement actual email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  const msg = {
    to: email,
    from: 'noreply@quranapp.com',
    subject: language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset',
    html: generatePasswordResetEmailTemplate(resetLink, userName, language)
  }
  
  await sgMail.send(msg)
  */
  
  return true
}

function generatePasswordResetEmailTemplate(resetLink: string, userName: string, language: string) {
  if (language === 'ar') {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #5955DD; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
            <p>تطبيق القرآن الكريم</p>
          </div>
          <div class="content">
            <p>السلام عليكم ${userName},</p>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>إذا كنت قد طلبت ذلك، يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetLink}" class="button">إعادة تعيين كلمة المرور</a>
            <p><strong>ملاحظة مهمة:</strong></p>
            <ul>
              <li>هذا الرابط صالح لمدة 30 دقيقة فقط</li>
              <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا الإيميل</li>
              <li>لا تشارك هذا الرابط مع أي شخص آخر</li>
            </ul>
            <p>إذا كنت تواجه مشاكل في النقر على الرابط، يمكنك نسخ ولصق الرابط التالي في متصفحك:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>تطبيق القرآن الكريم - تلاوة وتدبر وثواب</p>
            <p>هذا إيميل تلقائي، يرجى عدم الرد عليه</p>
          </div>
        </div>
      </body>
      </html>
    `
  } else {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #5955DD; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
            <p>Quran Reading App</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your account password.</p>
            <p>If you requested this, please click the link below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p><strong>Important Note:</strong></p>
            <ul>
              <li>This link is valid for 30 minutes only</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Don't share this link with anyone else</li>
            </ul>
            <p>If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>Quran Reading App - Read, Reflect, Earn Rewards</p>
            <p>This is an automated email, please do not reply</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json()
    const { email, language = 'ar', deviceInfo } = body

    // Validate email
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني مطلوب',
        code: 'MISSING_EMAIL'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'تنسيق البريد الإلكتروني غير صحيح',
        code: 'INVALID_EMAIL'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()

    // Find user by email
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      'status.isActive': true
    })

    // Always return success for security (don't reveal if email exists)
    const successMessage = language === 'ar' 
      ? 'إذا كان البريد الإلكتروني موجود في نظامنا، ستتلقى رابط إعادة تعيين كلمة المرور'
      : 'If the email exists in our system, you will receive a password reset link'

    if (!user) {
      // Log attempt for security monitoring
      await db.collection('security_logs').insertOne({
        eventType: 'password_reset_attempt_invalid_email',
        email: email.toLowerCase(),
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        deviceInfo: deviceInfo || null
      })

      return NextResponse.json({
        success: true,
        message: successMessage
      })
    }

    // Check if user registered with Google (no password)
    if (!user.password && user.googleId) {
      return NextResponse.json({
        success: false,
        message: language === 'ar' 
          ? 'هذا الحساب مسجل عبر Google. يرجى تسجيل الدخول باستخدام Google'
          : 'This account is registered with Google. Please login with Google',
        code: 'GOOGLE_ACCOUNT'
      }, { status: 400 })
    }

    // Check if account is suspended
    if (user.status?.isSuspended) {
      return NextResponse.json({
        success: false,
        message: language === 'ar'
          ? 'تم إيقاف حسابك. يرجى التواصل مع الدعم'
          : 'Your account is suspended. Please contact support',
        code: 'ACCOUNT_SUSPENDED'
      }, { status: 403 })
    }

    // Check for recent password reset requests (rate limiting)
    const recentReset = await db.collection('password_resets').findOne({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
    })

    if (recentReset) {
      return NextResponse.json({
        success: false,
        message: language === 'ar'
          ? 'يرجى الانتظار قبل طلب إعادة تعيين كلمة المرور مرة أخرى'
          : 'Please wait before requesting another password reset',
        code: 'TOO_MANY_REQUESTS'
      }, { status: 429 })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Store reset token
    await db.collection('password_resets').insertOne({
      userId: user._id,
      email: user.email,
      tokenHash: resetTokenHash,
      expiresAt: expiresAt,
      used: false,
      createdAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      deviceInfo: deviceInfo || null
    })

    // Send password reset email
    try {
      const userName = user.profile?.displayName || user.profile?.firstName || 'المستخدم'
      await sendPasswordResetEmail(user.email, resetToken, userName, language)
      
      // Log successful password reset request
      await db.collection('security_logs').insertOne({
        eventType: 'password_reset_email_sent',
        userId: user._id,
        email: user.email,
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        deviceInfo: deviceInfo || null
      })

    } catch (emailError) {
      console.error('Email sending error:', emailError)
      
      // Remove the reset token if email fails
      await db.collection('password_resets').deleteOne({
        userId: user._id,
        tokenHash: resetTokenHash
      })

      return NextResponse.json({
        success: false,
        message: language === 'ar'
          ? 'خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى'
          : 'Error sending email. Please try again',
        code: 'EMAIL_SEND_ERROR'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        emailSent: true,
        expiresIn: 30 * 60 // 30 minutes in seconds
      }
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Verify reset token (optional endpoint for checking token validity)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json({
        success: false,
        message: 'رمز إعادة التعيين والبريد الإلكتروني مطلوبان',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()

    // Hash the provided token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    // Find reset token
    const resetRecord = await db.collection('password_resets').findOne({
      email: email.toLowerCase(),
      tokenHash: tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!resetRecord) {
      return NextResponse.json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية',
        code: 'INVALID_TOKEN'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'رمز إعادة التعيين صالح',
      data: {
        valid: true,
        expiresAt: resetRecord.expiresAt
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}