/**
 * Price Alert Notification Service
 *
 * Handles email notifications for Price Tracking 2.0
 * Sends alerts when target prices are reached
 */

import type { NotificationChannel, PriceAlertEvent } from '@/types/price-tracking';

export interface SendPriceAlertParams {
  userId: string;
  userEmail: string;
  userName?: string;
  event: PriceAlertEvent;
  channels: NotificationChannel[];
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
}

/**
 * Generate HTML email for price alert
 */
function generatePriceAlertEmail(
  userName: string | undefined,
  event: PriceAlertEvent
): string {
  const greeting = userName ? `${userName}님` : '고객님';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>가격 알림</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎯 가격 알림</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">희망하신 가격에 도달했습니다!</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-top: 0;">안녕하세요, ${greeting}!</p>

    <p style="font-size: 16px;">추적하고 계신 제품의 가격이 목표 가격에 도달했습니다.</p>

    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #667eea;">${event.productName}</h2>

      <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 15px; background: #f0f4ff; border-radius: 6px;">
        <div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">희망 가격</div>
          <div style="font-size: 20px; font-weight: bold; color: #667eea;">₩${event.targetPrice.toLocaleString()}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">현재 가격</div>
          <div style="font-size: 20px; font-weight: bold; color: #10b981;">₩${event.currentPrice.toLocaleString()}</div>
        </div>
      </div>

      <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <div style="font-size: 14px; color: #065f46; margin-bottom: 5px;">💰 예상 절감액</div>
        <div style="font-size: 24px; font-weight: bold; color: #059669;">
          ₩${event.priceDropAmount.toLocaleString()}
          <span style="font-size: 16px; margin-left: 8px;">(${event.priceDropPercentage.toFixed(1)}% 할인)</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${event.purchaseUrl || `https://igosa.kr/products/${event.productId}`}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        지금 구매하기
      </a>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        ⏰ 이 가격은 ${new Date(event.expiresAt).toLocaleString('ko-KR')}까지 유효합니다.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
      이 이메일은 가격 알림 설정에 따라 자동으로 발송되었습니다.<br>
      알림을 받지 않으려면 <a href="https://igosa.kr/my" style="color: #667eea;">설정</a>에서 변경하실 수 있습니다.
    </p>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 15px 0 0 0;">
      © 2025 이거사 (IGOSA). All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send email notification (mock implementation)
 * In production, this would use SendGrid or similar service
 */
async function sendEmailNotification(
  email: string,
  userName: string | undefined,
  event: PriceAlertEvent
): Promise<NotificationResult> {
  try {
    const emailBody = generatePriceAlertEmail(userName, event);
    const subject = `🎯 가격 알림: ${event.productName}`;

    // Mock email sending (logs to console)
    console.log('📧 Price Alert Email Mock:');
    console.log('  To:', email);
    console.log('  Subject:', subject);
    console.log('  Product:', event.productName);
    console.log('  Target Price:', `₩${event.targetPrice.toLocaleString()}`);
    console.log('  Current Price:', `₩${event.currentPrice.toLocaleString()}`);
    console.log('  Savings:', `₩${event.priceDropAmount.toLocaleString()} (${event.priceDropPercentage.toFixed(1)}%)`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In production, use SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: email,
      from: {
        email: 'noreply@igosa.kr',
        name: '이거사 (IGOSA)'
      },
      subject: subject,
      html: emailBody,
    });
    */

    return {
      success: true,
      channel: 'email',
      messageId: `mock-email-${Date.now()}`,
    };
  } catch (error: any) {
    console.error('Email notification error:', error);
    return {
      success: false,
      channel: 'email',
      error: error.message,
    };
  }
}

/**
 * Send push notification (placeholder)
 */
async function sendPushNotification(
  userId: string,
  event: PriceAlertEvent
): Promise<NotificationResult> {
  console.log('📱 Push Notification Mock:');
  console.log('  User ID:', userId);
  console.log('  Title:', `가격 알림: ${event.productName}`);
  console.log('  Body:', `₩${event.currentPrice.toLocaleString()}로 떨어졌어요! (${event.priceDropPercentage.toFixed(1)}% 할인)`);

  return {
    success: true,
    channel: 'push',
    messageId: `push-mock-${Date.now()}`,
  };
}

/**
 * Main price alert notification service
 */
export const priceAlertNotification = {
  /**
   * Send price alert via specified channels
   */
  async send(params: SendPriceAlertParams): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channel of params.channels) {
      let result: NotificationResult;

      switch (channel) {
        case 'email':
          result = await sendEmailNotification(
            params.userEmail,
            params.userName,
            params.event
          );
          break;

        case 'push':
          result = await sendPushNotification(params.userId, params.event);
          break;

        case 'kakao':
          console.log('📲 Kakao notification not implemented');
          result = {
            success: false,
            channel: 'kakao',
            error: 'Not implemented',
          };
          break;

        case 'sms':
          console.log('📱 SMS notification not implemented');
          result = {
            success: false,
            channel: 'sms',
            error: 'Not implemented',
          };
          break;

        default:
          result = {
            success: false,
            channel,
            error: 'Unknown channel',
          };
      }

      results.push(result);
    }

    return results;
  },

  /**
   * Send test notification
   */
  async sendTest(email: string, userName?: string): Promise<NotificationResult> {
    const mockEvent: PriceAlertEvent = {
      trackingId: 'test-123',
      userId: 'user-1',
      productId: 'product-1',
      productName: '애플 에어팟 프로 2세대',
      targetPrice: 280000,
      currentPrice: 275000,
      priceDropAmount: 50000,
      priceDropPercentage: 15.38,
      triggeredAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      purchaseUrl: 'https://igosa.kr/products/product-1',
    };

    return sendEmailNotification(email, userName, mockEvent);
  },

  /**
   * Generate email HTML (for preview/testing)
   */
  generateEmailHTML(userName: string | undefined, event: PriceAlertEvent): string {
    return generatePriceAlertEmail(userName, event);
  },
};
