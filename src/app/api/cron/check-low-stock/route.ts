import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { Product, Notification } from '@/types';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const STOCK_THRESHOLD = 10;

async function sendLowStockEmail(sellerEmail: string, data: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: sellerEmail,
      template: 'lowStockAlert',
      data,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send low stock email');
  }
}

export async function POST(request: Request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productsSnapshot = await db.collection('products').get();
    const lowStockItems: any[] = [];

    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data() as Product;
      product.id = productDoc.id;

      // Check product-level inventory if variants don't exist or are not managed
      if (product.inventoryTracked && (!product.variants || product.variants.length === 0)) {
        if (product.inventory !== undefined && product.inventory <= STOCK_THRESHOLD) {
          lowStockItems.push({ product, variant: null });
        }
      }
      // Check variant-level stock
      else if (product.variants && product.variants.length > 0 && product.variantStock) {
        for (const variant of product.variants) {
            const variantKey = variant.name;
            const stock = product.variantStock[variantKey];
            if (stock !== undefined && stock <= STOCK_THRESHOLD) {
                lowStockItems.push({ product, variant });
            }
        }
      }
    }

    for (const item of lowStockItems) {
      const { product, variant } = item;

      const notificationQuery = db.collection('notifications')
        .where('productId', '==', product.id)
        .where('variantId', '==', (variant ? variant.name : null))
        .where('type', '==', (variant ? 'LOW_STOCK_VARIANT' : 'LOW_STOCK_PRODUCT'))
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(1);

      const existingNotifications = await notificationQuery.get();

      if (existingNotifications.empty) {
        const userProfileDoc = await db.collection('users').doc(product.userId!).get();
        const userProfile = userProfileDoc.data();

        if (userProfile) {
          const notificationId = db.collection('notifications').doc().id;
          const notification: Notification = {
            id: notificationId,
            userId: product.userId!,
            storeId: product.storeId!,
            type: variant ? 'LOW_STOCK_VARIANT' : 'LOW_STOCK_PRODUCT',
            message: `${product.name}${variant ? ` (${variant.name})` : ''} is low on stock. Only ${variant ? product.variantStock![variant.name] : product.inventory} left.`,
            productId: product.id,
            productName: product.name,
            variantId: variant ? variant.name : undefined,
            variantName: variant ? variant.name : undefined,
            remainingStock: variant ? product.variantStock![variant.name] : product.inventory!,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection('notifications').doc(notificationId).set(notification);

          const emailData = {
            productName: product.name,
            variantName: variant ? variant.name : undefined,
            remainingStock: variant ? product.variantStock![variant.name] : product.inventory!,
            linkToProduct: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products/${product.id}`,
          };

          await sendLowStockEmail(userProfile.email, emailData);
        }
      }
    }

    return NextResponse.json({ message: 'Low stock check completed successfully.', checked: productsSnapshot.size, found: lowStockItems.length });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}