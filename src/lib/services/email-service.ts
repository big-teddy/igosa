/**
 * Email Service
 * SendGrid 기반 이메일 전송
 */

import { logger } from '@/lib/logger';

// SendGrid 타입 (실제 설치 시 @sendgrid/mail 사용)
interface EmailData {
    to: string | string[];
    from: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private static readonly FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@igosa.kr';
    private static readonly FROM_NAME = '이거사 (Igosa)';

    /**
     * 판매자에게 협상 제안 이메일 전송
     */
    static async sendNegotiationProposal(
        sellerEmail: string,
        proposal: {
            negotiationId: string;
            productName: string;
            proposedPrice: number;
            proposedVolume: number;
            currentPrice: number;
            estimatedRevenue: number;
            estimatedMargin: number;
            expiresAt: Date;
            reasoning: string[];
        }
    ): Promise<boolean> {
        try {
            const savings = proposal.currentPrice - proposal.proposedPrice;
            const discountPercent = ((savings / proposal.currentPrice) * 100).toFixed(1);

            const html = this.renderProposalTemplate({
                ...proposal,
                savings,
                discountPercent,
            });

            const emailData: EmailData = {
                to: sellerEmail,
                from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
                subject: `[이거사] 새로운 네고딜 제안 - ${proposal.productName}`,
                html,
                text: this.stripHtml(html),
            };

            await this.send(emailData);

            logger.info('Proposal email sent', {
                sellerEmail,
                negotiationId: proposal.negotiationId,
            });

            return true;
        } catch (error) {
            logger.error('Failed to send proposal email', error as Error, {
                sellerEmail,
                negotiationId: proposal.negotiationId,
            });
            return false;
        }
    }

    /**
     * 사용자에게 협상 성공 이메일 전송
     */
    static async sendNegotiationSuccess(
        userEmail: string,
        data: {
            userName: string;
            productName: string;
            productImage: string;
            targetPrice: number;
            finalPrice: number;
            savings: number;
            purchaseUrl: string;
            expiresAt: Date;
        }
    ): Promise<boolean> {
        try {
            const html = this.renderSuccessTemplate(data);

            const emailData: EmailData = {
                to: userEmail,
                from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
                subject: `🎉 네고딜 성공! ${data.productName} ₩${data.finalPrice.toLocaleString()}`,
                html,
                text: this.stripHtml(html),
            };

            await this.send(emailData);

            logger.info('Success email sent', { userEmail });

            return true;
        } catch (error) {
            logger.error('Failed to send success email', error as Error, { userEmail });
            return false;
        }
    }

    /**
     * 실제 이메일 전송 (SendGrid)
     */
    private static async send(emailData: EmailData): Promise<void> {
        // TODO: SendGrid 연동
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // await sgMail.send(emailData);

        // 현재: 로그만 기록
        logger.info('Email would be sent', {
            to: emailData.to,
            subject: emailData.subject,
        });

        // Mock: 개발 환경에서는 콘솔에 출력
        if (process.env.NODE_ENV === 'development') {
            console.log('\n📧 Email Preview:');
            console.log('To:', emailData.to);
            console.log('Subject:', emailData.subject);
            console.log('---');
            console.log(emailData.text || this.stripHtml(emailData.html));
            console.log('---\n');
        }
    }

    /**
     * 협상 제안 이메일 템플릿
     */
    private static renderProposalTemplate(data: {
        productName: string;
        proposedPrice: number;
        proposedVolume: number;
        currentPrice: number;
        estimatedRevenue: number;
        estimatedMargin: number;
        savings: number;
        discountPercent: string;
        expiresAt: Date;
        reasoning: string[];
        negotiationId: string;
    }): string {
        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/seller/negotiations/${data.negotiationId}/accept`;
        const rejectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/seller/negotiations/${data.negotiationId}/reject`;
        const counterUrl = `${process.env.NEXT_PUBLIC_APP_URL}/seller/negotiations/${data.negotiationId}/counter`;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>새로운 네고딜 제안</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #111827; }
    .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .button-primary { background: #10b981; color: white; }
    .button-secondary { background: #6b7280; color: white; }
    .button-outline { background: white; color: #6b7280; border: 2px solid #6b7280; }
    .reasoning { background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🤖 AI 네고딜 제안</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.productName}</p>
    </div>
    
    <div class="content">
      <div class="card">
        <h2>제안 요약</h2>
        <div class="metric">
          <div class="metric-label">제안 가격</div>
          <div class="metric-value">₩${data.proposedPrice.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">수량</div>
          <div class="metric-value">${data.proposedVolume}개</div>
        </div>
        <div class="metric">
          <div class="metric-label">예상 수익</div>
          <div class="metric-value">₩${data.estimatedRevenue.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">예상 마진</div>
          <div class="metric-value">${data.estimatedMargin.toFixed(1)}%</div>
        </div>
      </div>
      
      <div class="card">
        <h3>💡 AI 분석 결과</h3>
        <div class="reasoning">
          ${data.reasoning.map(r => `<p style="margin: 5px 0;">${r}</p>`).join('')}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          현재가 대비 ${data.discountPercent}% 할인 (₩${data.savings.toLocaleString()} 절감)
        </p>
      </div>
      
      <div class="card">
        <h3>⏰ 응답 기한</h3>
        <p><strong>${new Date(data.expiresAt).toLocaleString('ko-KR')}</strong>까지 응답해주세요.</p>
        <p style="color: #6b7280; font-size: 14px;">
          48시간 내 응답이 없으면 자동으로 거절됩니다.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${acceptUrl}" class="button button-primary">✅ 수락하기</a>
        <a href="${counterUrl}" class="button button-outline">💬 역제안하기</a>
        <a href="${rejectUrl}" class="button button-secondary">❌ 거절하기</a>
      </div>
    </div>
    
    <div class="footer">
      <p>이거사 (Igosa) - AI 기반 쇼핑 협상 플랫폼</p>
      <p>문의: support@igosa.kr</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }

    /**
     * 협상 성공 이메일 템플릿
     */
    private static renderSuccessTemplate(data: {
        userName: string;
        productName: string;
        productImage: string;
        targetPrice: number;
        finalPrice: number;
        savings: number;
        purchaseUrl: string;
        expiresAt: Date;
    }): string {
        const priceDiff = data.targetPrice - data.finalPrice;
        const diffText = priceDiff > 0
            ? `목표가보다 ₩${Math.abs(priceDiff).toLocaleString()} 더 저렴해요!`
            : priceDiff < 0
                ? `목표가보다 ₩${Math.abs(priceDiff).toLocaleString()} 높지만 최선의 가격이에요`
                : `정확히 목표가에 맞췄어요!`;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>네고딜 성공!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .product { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .product img { max-width: 200px; border-radius: 8px; }
    .price-box { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .price { font-size: 36px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; padding: 16px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🎉 네고딜 성공!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">${data.userName}님, 축하드려요!</p>
    </div>
    
    <div class="content">
      <div class="product">
        <img src="${data.productImage}" alt="${data.productName}" />
        <h2>${data.productName}</h2>
      </div>
      
      <div class="price-box">
        <p style="margin: 0; color: #6b7280;">최종 협상 가격</p>
        <div class="price">₩${data.finalPrice.toLocaleString()}</div>
        <p style="margin: 10px 0 0 0; color: #059669; font-weight: 600;">
          ₩${data.savings.toLocaleString()} 절약!
        </p>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
          ${diffText}
        </p>
      </div>
      
      <div class="warning">
        <p style="margin: 0; font-weight: 600;">⏰ 48시간 내 구매하세요!</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">
          ${new Date(data.expiresAt).toLocaleString('ko-KR')}까지 할인가로 구매 가능해요.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.purchaseUrl}" class="button">지금 구매하기 →</a>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3>🎁 친구에게 공유하면 추가 혜택!</h3>
        <p>친구를 초대하면 ₩1,000 쿠폰을 드려요.</p>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      <p>이거사 (Igosa) - AI 기반 쇼핑 협상 플랫폼</p>
      <p>문의: support@igosa.kr</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }

    /**
     * HTML에서 텍스트만 추출
     */
    private static stripHtml(html: string): string {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
