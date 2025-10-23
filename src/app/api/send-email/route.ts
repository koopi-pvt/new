import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { createOrderConfirmationHtml } from '@/lib/email/templates/orderConfirmation';
import { createOrderStatusUpdateHtml } from '@/lib/email/templates/orderStatusUpdate';
import { createGenericEmailHtml } from '@/lib/email/templates/generic';
import { createNewMessageEmailHtml } from '@/lib/email/templates/newMessage';
import { createLowStockAlertHtml } from '@/lib/email/templates/lowStockAlert';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    if (!to || !template || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    switch (template) {
      case 'orderConfirmation':
        subject = `Your order from ${data.storeName} is confirmed!`;
        html = createOrderConfirmationHtml(data);
        break;
      case 'orderStatusUpdate':
        subject = `Update on your order #${data.orderNumber}`;
        html = createOrderStatusUpdateHtml(data);
        break;
      case 'newMessage':
        subject = `💬 New message - Order #${data.orderNumber}`;
        html = createNewMessageEmailHtml(data);
        break;
      case 'generic':
        subject = data.title;
        html = createGenericEmailHtml(data);
        break;
      case 'lowStockAlert':
        subject = `Low Stock Alert for ${data.productName}`;
        html = createLowStockAlertHtml(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid template specified' }, { status: 400 });
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html,
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    // It's good practice to check for SendGrid specific errors
    if ((error as any).response) {
      console.error((error as any).response.body)
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}