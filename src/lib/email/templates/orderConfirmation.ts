import { createBaseTemplate } from './base';

interface OrderConfirmationData {
  orderNumber: string;
  total: number;
  shippingName: string;
  shippingAddress: string;
  items: { name: string; quantity: number; price: number }[];
  storeName: string;
}

export const createOrderConfirmationHtml = (data: OrderConfirmationData) => {
  const content = `
    <p>Hi ${data.shippingName},</p>
    <p>Thanks for your order! We've received it and will let you know when it ships. Here are the details:</p>
    <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;" />
    <h3 style="margin-top:0;">Order Summary</h3>
    <p><strong>Order Number:</strong> ${data.orderNumber}</p>
    <p><strong>Total:</strong> LKR ${data.total.toFixed(2)}</p>
    <p><strong>Shipping to:</strong><br />${data.shippingAddress.replace(/\n/g, '<br />')}</p>
    <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;" />
    <h3>Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${data.items.map(item => `
        <tr>
          <td style="padding: 8px 0;">${item.name} (x${item.quantity})</td>
          <td style="padding: 8px 0; text-align: right;">LKR ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
    <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;" />
    <p>We'll notify you again once your order has shipped. You can view your order status by visiting the store.</p>
    <p>Thanks for shopping with ${data.storeName}!</p>
  `;

  return createBaseTemplate(content, `Order Confirmed: #${data.orderNumber}`);
};