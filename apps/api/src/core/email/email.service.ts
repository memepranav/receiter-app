import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../logger/logger.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransporter(smtpConfig);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.loggerService.errorWithContext('SMTP connection failed', error.stack);
      } else {
        this.loggerService.logWithContext('SMTP server ready to send emails');
      }
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: this.configService.get('APP_NAME') || 'Quran Reciter',
          address: this.configService.get('SMTP_USER'),
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.loggerService.logWithContext('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });

      return true;
    } catch (error) {
      this.loggerService.errorWithContext('Failed to send email', error.stack, {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - Quran Reciter</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }
          .button { display: inline-block; background: #5955DD; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🕌 Welcome to Quran Reciter</h1>
            <p>Verify your email to start your spiritual journey</p>
          </div>
          
          <div class="content">
            <h2>Email Verification Required</h2>
            <p>Thank you for creating an account with Quran Reciter! To complete your registration and start reading the Holy Quran, please verify your email address.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationUrl}
            </p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
          </div>
          
          <div class="footer">
            <p>If you didn't create an account with Quran Reciter, please ignore this email.</p>
            <p>© 2025 Quran Reciter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Quran Reciter',
      html,
      text: `Welcome to Quran Reciter! Please verify your email by clicking this link: ${verificationUrl}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Quran Reciter</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }
          .button { display: inline-block; background: #5955DD; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Quran Reciter Account Security</p>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset the password for your Quran Reciter account. If you made this request, click the button below to set a new password.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>For security questions, contact our support team.</p>
            <p>© 2025 Quran Reciter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Quran Reciter',
      html,
      text: `Reset your Quran Reciter password by clicking this link: ${resetUrl} (expires in 1 hour)`,
    });
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Quran Reciter</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #5955DD; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🕌 Welcome to Quran Reciter, ${name}!</h1>
            <p>Your spiritual journey begins now</p>
          </div>
          
          <div class="content">
            <h2>Assalam Alaikum! 🌙</h2>
            <p>Your email has been verified successfully! Welcome to the Quran Reciter family. We're honored to be part of your spiritual journey.</p>
            
            <h3>✨ What you can do now:</h3>
            
            <div class="feature">
              <h4>📖 Read the Holy Quran</h4>
              <p>Access all 30 Juz with multiple translations and reciters</p>
            </div>
            
            <div class="feature">
              <h4>📚 Track Your Progress</h4>
              <p>Monitor your reading sessions and celebrate milestones</p>
            </div>
            
            <div class="feature">
              <h4>🔖 Create Bookmarks</h4>
              <p>Save your favorite verses with personal notes</p>
            </div>
            
            <div class="feature">
              <h4>🎁 Earn Rewards</h4>
              <p>Get points and tokens for consistent reading</p>
            </div>
            
            <div class="feature">
              <h4>🏆 Join the Community</h4>
              <p>Connect with other readers and compete on leaderboards</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <strong>May Allah bless your reading journey! 🤲</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Download the mobile app to start reading anywhere, anytime.</p>
            <p>© 2025 Quran Reciter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Quran Reciter - Your Journey Begins! 🕌',
      html,
      text: `Welcome to Quran Reciter, ${name}! Your account is now verified and ready. Start your spiritual journey by reading the Holy Quran with our mobile app.`,
    });
  }
}