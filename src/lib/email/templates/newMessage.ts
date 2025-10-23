import { createBaseTemplate } from './base';

interface NewMessageEmailData {
  recipientType: 'buyer' | 'seller';
  senderName: string;
  messagePreview: string;
  orderNumber: string;
  trackingLink: string;
}

export function createNewMessageEmailHtml(data: NewMessageEmailData): string {
  const { recipientType, senderName, messagePreview, orderNumber, trackingLink } = data;
  
  const greeting = recipientType === 'buyer' ? 'Hello!' : 'Hello Seller,';
  const fromText = recipientType === 'buyer' 
    ? `You have a new message from ${senderName} regarding your order.`
    : `You have a new message from ${senderName} about order #${orderNumber}.`;

  const content = `
    <div style="margin: 30px 0;">
      <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">
        💬 New Message
      </h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${fromText}
      </p>
      
      <div style="background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #374151; font-size: 14px; margin: 0; font-style: italic;">
          "${messagePreview}${messagePreview.length >= 100 ? '...' : ''}"
        </p>
      </div>
      
      <div style="margin-top: 30px;">
        <a href="${trackingLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Conversation
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
        <strong>Order #${orderNumber}</strong><br/>
        Click the button above to view the full conversation and reply.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
        You're receiving this email because someone sent you a message about your order. 
        You can manage your email notification preferences in your account settings.
      </p>
    </div>
  `;

  return createBaseTemplate(
    content,
    `New Message - Order #${orderNumber}`
  );
}
