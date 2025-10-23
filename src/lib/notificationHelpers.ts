import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Types for notification settings
export type NotificationSettings = {
  emailOnNewMessage: boolean;
  emailOnOrderStatusChange: boolean;
  emailOnNewOrder: boolean;
  inAppNotifications: boolean;
};

export const defaultNotificationSettings: NotificationSettings = {
  emailOnNewMessage: true,
  emailOnOrderStatusChange: true,
  emailOnNewOrder: true,
  inAppNotifications: true,
};

// Create in-app notification
export async function createNotification(
  userId: string,
  message: string,
  link: string,
  type: 'new_message' | 'new_order' | 'order_status_change'
) {
  try {
    // Check if user has in-app notifications enabled
    const userDoc = await getDoc(doc(db, 'stores', userId));
    if (userDoc.exists()) {
      const settings = userDoc.data()?.notificationSettings || defaultNotificationSettings;
      if (!settings.inAppNotifications) {
        return; // User has disabled in-app notifications
      }
    }

    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      link,
      type,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Send email notification for new message
export async function sendMessageEmailNotification(
  recipientEmail: string,
  senderName: string,
  messagePreview: string,
  orderId: string,
  orderNumber: string,
  recipientType: 'buyer' | 'seller'
) {
  try {
    const trackingLink = recipientType === 'buyer' 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/buyer/track-order/${orderId}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders/${orderId}`;

    const emailData = {
      to: recipientEmail,
      template: 'newMessage',
      data: {
        recipientType,
        senderName,
        messagePreview: messagePreview.substring(0, 100), // Limit preview length
        orderNumber,
        trackingLink,
      }
    };

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.error('Failed to send message email notification');
    }
  } catch (error) {
    console.error('Error sending message email notification:', error);
  }
}

// Check if user has email notifications enabled for messages
export async function shouldSendMessageEmail(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'stores', userId));
    if (userDoc.exists()) {
      const settings = userDoc.data()?.notificationSettings || defaultNotificationSettings;
      return settings.emailOnNewMessage;
    }
    return true; // Default to true if settings don't exist
  } catch (error) {
    console.error('Error checking email notification settings:', error);
    return true; // Default to true on error
  }
}

// Get buyer notification settings (stored in buyers collection)
export async function getBuyerNotificationSettings(buyerId: string): Promise<NotificationSettings> {
  try {
    const buyerDoc = await getDoc(doc(db, 'buyers', buyerId));
    if (buyerDoc.exists()) {
      return buyerDoc.data()?.notificationSettings || defaultNotificationSettings;
    }
    return defaultNotificationSettings;
  } catch (error) {
    console.error('Error getting buyer notification settings:', error);
    return defaultNotificationSettings;
  }
}

// Get seller notification settings (stored in stores collection)
export async function getSellerNotificationSettings(sellerId: string): Promise<NotificationSettings> {
  try {
    const sellerDoc = await getDoc(doc(db, 'stores', sellerId));
    if (sellerDoc.exists()) {
      return sellerDoc.data()?.notificationSettings || defaultNotificationSettings;
    }
    return defaultNotificationSettings;
  } catch (error) {
    console.error('Error getting seller notification settings:', error);
    return defaultNotificationSettings;
  }
}
