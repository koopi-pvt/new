'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, Truck, CheckCircle, XCircle, Send, MessageCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import withAuth from '@/components/withAuth';
import { InlineLoader } from '@/components/ui/InlineLoader';
import { ButtonLoader } from '@/components/ui/ButtonLoader';
import { Order } from '@/types';
import { createNotification, getBuyerNotificationSettings } from '@/lib/notificationHelpers';

type Message = {
  id: string;
  orderId: string;
  senderId: string;
  senderType: 'buyer' | 'seller';
  senderName: string;
  message: string;
  createdAt: any;
};

function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [storeName, setStoreName] = useState('');

  // Set page title dynamically
  useEffect(() => {
    if (order) {
      document.title = `Order #${order.orderNumber} - Koopi Dashboard`;
    }
  }, [order]);

  useEffect(() => {
    if (user) {
      fetchStoreAndOrder();
    }
  }, [orderId, user]);

  useEffect(() => {
    if (!orderId) return;

    // Real-time messages listener
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

  const fetchStoreAndOrder = async () => {
    if (!user) return;

    try {
      // Get store name
      const storeDoc = await getDoc(doc(db, 'stores', user.uid));
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        setStoreName(storeData.storeName);

        // Fetch order
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
          
          // Verify this order belongs to this store
          if (orderData.storeName === storeData.storeName) {
            setOrder(orderData);
          } else {
            alert('This order does not belong to your store');
            router.push('/dashboard/orders');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order || updating) return;

    const confirmed = window.confirm(`Are you sure you want to update the order status to "${newStatus}"?`);
    if (!confirmed) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      setOrder({ ...order, status: newStatus });

     // Send status update email
     try {
       const emailData = {
         to: order.buyerEmail,
         template: 'orderStatusUpdate',
         data: {
           orderNumber: order.orderNumber,
           newStatus: newStatus,
           shippingName: order.shippingAddress.name,
           storeName: storeName,
         }
       };
       await fetch('/api/send-email', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(emailData),
       });
     } catch (emailError) {
       console.error("Failed to send status update email:", emailError);
       // Non-critical, so we don't show an error to the seller
     }

     alert('Order status updated successfully');
   } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !storeName || !order) return;

    setSendingMessage(true);
    try {
      // Add message to Firestore
      await addDoc(collection(db, 'messages'), {
        orderId,
        senderId: user.uid,
        senderType: 'seller',
        senderName: storeName,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      // Create in-app notification for buyer
      try {
        await createNotification(
          order.buyerId,
          `${storeName} sent you a message about order #${order.orderNumber}`,
          `/buyer/track-order/${orderId}`,
          'new_message'
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Send email notification to buyer if enabled
      try {
        const buyerSettings = await getBuyerNotificationSettings(order.buyerId);
        if (buyerSettings.emailOnNewMessage) {
          const emailData = {
            to: order.buyerEmail,
            template: 'newMessage',
            data: {
              recipientType: 'buyer',
              senderName: storeName,
              messagePreview: newMessage.trim(),
              orderNumber: order.orderNumber,
              trackingLink: `${window.location.origin}/buyer/track-order/${orderId}`,
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

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        
        <div className="flex-1 ml-64 flex items-center justify-center">
          <InlineLoader message="Loading order details..." primaryColor="#000000" size="md" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
            <Link href="/dashboard/orders" className="text-gray-900 font-semibold hover:underline">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between print:hidden gap-4">
          <div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 sm:mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Orders</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 text-sm sm:text-base">Placed on {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex self-start sm:self-center items-center gap-2 px-4 py-2 bg-white/80 border border-gray-300 rounded-full hover:bg-white transition-colors shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4 sm:p-6 print:border-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <StatusIcon className="w-5 h-5" />
                  Order Status
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating || order.status === status}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                      order.status === status
                        ? 'bg-blue-500 text-white shadow-md cursor-not-allowed'
                        : 'bg-white/80 text-gray-900 hover:bg-white active:scale-95'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4 sm:p-6 print:border-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 sm:w-20 sm:h-20 bg-white/50 rounded-xl flex-shrink-0 print:w-16 print:h-16 border border-gray-200/50 self-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500 mt-1">
                          {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">LKR {item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="font-semibold text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200/50 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">LKR {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount && order.discount.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({order.discount.code})</span>
                    <span className="font-medium">-LKR {order.discount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{order.shipping === 0 ? 'Free' : `LKR ${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200/50 pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>LKR {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Messaging Section */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 print:hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Customer Messages
              </h2>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto p-1">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'seller' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${msg.senderType === 'seller' ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-900'}`}>
                        <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-60 text-right">
                          {msg.createdAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Reply to customer..."
                  className="flex-1 px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="px-5 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-md active:scale-95"
                >
                  {sendingMessage ? <ButtonLoader color="#ffffff" size="sm" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 print:border-0">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{order.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 print:border-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 print:border-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment
              </h3>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                <Package className="w-5 h-5 text-green-700" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-600">Payment pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrderDetailPage);
