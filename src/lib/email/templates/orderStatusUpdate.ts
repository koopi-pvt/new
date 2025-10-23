import { createBaseTemplate } from './base';

interface OrderStatusUpdateData {
  orderNumber: string;
  newStatus: string;
  shippingName: string;
  storeName: string;
}

export const createOrderStatusUpdateHtml = (data: OrderStatusUpdateData) => {
  let statusMessage = '';
  switch (data.newStatus) {
    case 'processing':
      statusMessage = 'Your order is now being processed. We are getting your items ready for shipment.';
      break;
    case 'shipped':
      statusMessage = 'Good news! Your order has been shipped. You can expect it to arrive soon.';
      break;
    case 'delivered':
      statusMessage = 'Your order has been delivered. We hope you enjoy your purchase!';
      break;
    default:
      statusMessage = `Your order status has been updated to: ${data.newStatus}.`;
  }

  const content = `
    <p>Hi ${data.shippingName},</p>
    <p>We have an update on your order #${data.orderNumber} from ${data.storeName}.</p>
    <div style="background-color: #f1f1f1; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
      <h3 style="margin:0; font-size: 18px;">${statusMessage}</h3>
    </div>
    <p>You can view the full details of your order by visiting the store's website.</p>
    <p>Thanks for your patience!</p>
  `;

  return createBaseTemplate(content, `Update on Order #${data.orderNumber}`);
};