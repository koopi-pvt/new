import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { orderId, newStatus, previousStatus } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and new status are required' }, { status: 400 });
    }

    // Get the order
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();

    // Check if user owns this store
    if (orderData?.storeId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 });
    }

    // Update order status
    await db.collection('orders').doc(orderId).update({
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Auto-reduce inventory when status changes to "Processing" or "Shipped"
    // Only reduce if it wasn't already reduced (prevent double reduction)
    if ((newStatus === 'Processing' || newStatus === 'Shipped') && 
        previousStatus !== 'Processing' && previousStatus !== 'Shipped') {
      
      await reduceInventory(orderData);
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}

async function reduceInventory(orderData: any) {
  try {
    const batch = db.batch();

    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) continue;

      const productData = productDoc.data();

      // If product has variants
      if (item.variant && productData?.variantStock) {
        const variantKey = Object.entries(item.variant)
          .map(([k, v]) => `${k}:${v}`)
          .sort()
          .join('|');

        const currentStock = productData.variantStock[variantKey] || 0;
        const newStock = Math.max(0, currentStock - item.quantity);

        batch.update(productRef, {
          [`variantStock.${variantKey}`]: newStock,
        });

        // Check if low stock threshold reached
        const threshold = productData.variantLowStockThreshold?.[variantKey] || productData.lowStockThreshold || 10;
        if (newStock <= threshold && newStock > 0) {
          // Create low stock notification
          await createLowStockNotification(orderData.storeId, item.productId, item.name, variantKey, newStock);
        }
      } else {
        // Simple inventory tracking
        const currentStock = productData?.inventory || productData?.quantity || 0;
        const newStock = Math.max(0, currentStock - item.quantity);

        batch.update(productRef, {
          inventory: newStock,
          quantity: newStock,
        });

        // Check if low stock threshold reached
        const threshold = productData?.lowStockThreshold || 10;
        if (newStock <= threshold && newStock > 0) {
          // Create low stock notification
          await createLowStockNotification(orderData.storeId, item.productId, item.name, null, newStock);
        }
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error reducing inventory:', error);
    throw error;
  }
}

async function createLowStockNotification(
  storeId: string, 
  productId: string, 
  productName: string, 
  variantKey: string | null, 
  remainingStock: number
) {
  try {
    const notificationData = {
      userId: storeId,
      storeId: storeId,
      type: variantKey ? 'LOW_STOCK_VARIANT' : 'LOW_STOCK_PRODUCT',
      message: variantKey 
        ? `Low stock alert: ${productName} (${variantKey}) - Only ${remainingStock} left`
        : `Low stock alert: ${productName} - Only ${remainingStock} left`,
      productId,
      productName,
      variantId: variantKey || undefined,
      variantName: variantKey || undefined,
      remainingStock,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
      link: `/dashboard/products`,
    };

    // Check if notification already exists for this product/variant
    const existingNotifications = await db.collection('notifications')
      .where('userId', '==', storeId)
      .where('productId', '==', productId)
      .where('type', '==', notificationData.type)
      .where('isRead', '==', false)
      .get();

    if (existingNotifications.empty) {
      await db.collection('notifications').add(notificationData);
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
}
