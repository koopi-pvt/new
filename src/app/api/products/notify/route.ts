import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { productId, email } = await request.json();

    if (!productId || !email) {
      return NextResponse.json({ error: 'Product ID and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get the product
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = productDoc.data();
    const notifyList = productData?.notifyWhenAvailable || [];

    // Check if email already in list
    if (notifyList.includes(email.toLowerCase())) {
      return NextResponse.json({ 
        success: true, 
        message: 'You are already on the notification list' 
      });
    }

    // Add email to notify list
    await productRef.update({
      notifyWhenAvailable: FieldValue.arrayUnion(email.toLowerCase()),
    });

    return NextResponse.json({
      success: true,
      message: 'You will be notified when this product is back in stock',
    });

  } catch (error: any) {
    console.error('Error adding to notify list:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add to notification list' },
      { status: 500 }
    );
  }
}
