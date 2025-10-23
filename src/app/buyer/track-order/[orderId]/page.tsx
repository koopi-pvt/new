'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { ArrowLeft, Package, MapPin, Send, MessageCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/PageLoader';
import { ButtonLoader } from '@/components/ui/ButtonLoader';
import { OrderTimeline } from '@/components/buyer/OrderTimeline';
import { Order } from '@/types';
import { createNotification, getSellerNotificationSettings } from '@/lib/notificationHelpers';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';

type Message = {
  id: string;
  orderId: string;
  senderId: string;
  senderType: 'buyer' | 'seller';
  senderName: string;
  message: string;
  createdAt: any;
};

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { buyer, buyerProfile, loading: authLoading } = useBuyerAuth();
  const { theme, setTheme } = useTheme();

  const themeStyles = themes[theme as keyof typeof themes] || themes.classic;

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (order) {
      document.title = `Track Order #${order.orderNumber} - Koopi`;
    }
  }, [order]);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('orderId', '==', orderId), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !buyer || !buyerProfile || !order) return;

    setSendingMessage(true);
    try {
      // Add message to Firestore
      await addDoc(collection(db, 'messages'), {
        orderId,
        senderId: buyer.uid,
        senderType: 'buyer',
        senderName: buyerProfile.name,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      // Get seller ID from order
      const storesRef = collection(db, 'stores');
      const storeQuery = query(storesRef, where('storeName', '==', order.storeName));
      const storeSnapshot = await getDocs(storeQuery);
      
      if (!storeSnapshot.empty) {
        const storeDoc = storeSnapshot.docs[0];
        const sellerId = storeDoc.id;
        const sellerEmail = storeDoc.data().email;

        // Create in-app notification for seller
        try {
          await createNotification(
            sellerId,
            `${buyerProfile.name} sent you a message about order #${order.orderNumber}`,
            `/dashboard/orders/${orderId}`,
            'new_message'
          );
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }

        // Send email notification to seller if enabled
        try {
          const sellerSettings = await getSellerNotificationSettings(sellerId);
          if (sellerSettings.emailOnNewMessage && sellerEmail) {
            const emailData = {
              to: sellerEmail,
              template: 'newMessage',
              data: {
                recipientType: 'seller',
                senderName: buyerProfile.name,
                messagePreview: newMessage.trim(),
                orderNumber: order.orderNumber,
                trackingLink: `${window.location.origin}/dashboard/orders/${orderId}`,
              }
            };
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(emailData),
            });
          }
        } catch (emailError) {
          console.error('Failed to send message email notification:', emailError);
        }
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading order details..." primaryColor="#000000" backgroundColor="#f9fafb" />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">This order does not exist</p>
          <Link href="/buyer/orders" className="text-gray-900 font-semibold hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      {/* Header */}
      <header className={`${themeStyles.header} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/buyer/orders"
            className={`flex items-center gap-2 ${theme === 'bold' ? 'text-yellow-400' : theme === 'minimalist' ? 'text-black' : 'text-gray-600'} hover:opacity-70 transition-opacity`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Orders</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Order Header */}
        <div className={`${themeStyles.card} p-6 sm:p-8 mb-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={themeStyles.title}>Order #{order.orderNumber}</h1>
              <p className={themeStyles.subtitle}>
                Placed on {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
              </p>
              <p className={themeStyles.subtitle}>Store: {order.storeName}</p>
            </div>
            {isCancelled && (
              <span className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase ${
                theme === 'bold' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
              }`}>
                <XCircle className="w-5 h-5" />
                Cancelled
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {!isCancelled && <OrderTimeline currentStatus={order.status} />}

            {/* Order Items */}
            <div className={`${themeStyles.card} p-6 sm:p-8`}>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'bold' ? 'text-yellow-400 uppercase' : theme === 'minimalist' ? 'text-black' : 'text-gray-900'}`}>
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className={`flex gap-4 pb-4 ${index !== order.items.length - 1 ? 'border-b' : ''} ${theme === 'bold' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`w-20 h-20 flex-shrink-0 rounded-lg ${theme === 'bold' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className={`w-8 h-8 ${theme === 'bold' ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'bold' ? 'text-white' : theme === 'classic' ? 'font-serif text-gray-800' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className={`text-sm ${theme === 'bold' ? 'text-gray-500 font-mono' : 'text-gray-500'}`}>
                          {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                      <p className={`text-sm ${theme === 'bold' ? 'text-gray-400 font-mono' : 'text-gray-600'}`}>
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className={`font-semibold ${theme === 'bold' ? 'text-yellow-400 font-mono' : theme === 'classic' ? 'font-serif text-gray-800' : 'text-gray-900'}`}>
                      LKR {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={`mt-6 pt-6 border-t ${theme === 'bold' ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
                <div className={`flex justify-between ${themeStyles.text}`}>
                  <span>Subtotal</span>
                  <span className="font-medium">LKR {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount && order.discount.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.discount.code})</span>
                    <span className="font-medium">-LKR {order.discount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`flex justify-between ${themeStyles.text}`}>
                  <span>Shipping</span>
                  <span className="font-medium">LKR {order.shipping.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between ${themeStyles.text}`}>
                  <span>Tax</span>
                  <span className="font-medium">LKR {order.tax.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t text-lg font-bold ${theme === 'bold' ? 'text-yellow-400 border-gray-700 font-mono' : theme === 'classic' ? 'text-gray-900 font-serif border-gray-200' : 'text-gray-900 border-gray-200'}`}>
                  <span>Total</span>
                  <span>LKR {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className={`${themeStyles.card} p-6`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'bold' ? 'text-yellow-400 uppercase' : theme === 'minimalist' ? 'text-black' : 'text-gray-900'}`}>
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className={`space-y-1 ${themeStyles.text} ${theme === 'bold' ? 'font-mono' : ''}`}>
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Messages */}
            <div className={`${themeStyles.card} p-6`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'bold' ? 'text-yellow-400 uppercase' : theme === 'minimalist' ? 'text-black' : 'text-gray-900'}`}>
                <MessageCircle className="w-5 h-5" />
                Messages
              </h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className={`text-sm ${theme === 'bold' ? 'text-gray-400 font-mono' : 'text-gray-500'}`}>
                    No messages yet. Start a conversation with the seller.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderType === 'buyer' ? themeStyles.messageMyBg : themeStyles.messageTheirBg
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${
                        msg.senderType === 'buyer' ? themeStyles.messageMySender : themeStyles.messageTheirSender
                      }`}>
                        {msg.senderName}
                      </p>
                      <p className={`text-sm ${theme === 'bold' ? 'font-mono' : ''}`}>{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-1 px-3 py-2 ${themeStyles.input}`}
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className={`px-4 py-2 ${themeStyles.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {sendingMessage ? <ButtonLoader color={theme === 'bold' ? '#000' : '#fff'} /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}