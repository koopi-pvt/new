'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Package, ShoppingBag, User, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/PageLoader';
import { InlineLoader } from '@/components/ui/InlineLoader';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  createdAt: any;
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const { buyer, buyerProfile, logout, loading: authLoading } = useBuyerAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !buyer) {
      router.push('/buyer/login?returnUrl=/buyer/orders');
      return;
    }

    if (buyer) {
      fetchOrders();
    }
  }, [buyer, authLoading, router]);

  const fetchOrders = async () => {
    if (!buyer) return;
    setError(null);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('buyerId', '==', buyer.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load orders. This might be a network issue or require a database index. Please contact support if the problem persists.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  if (authLoading || !buyer) {
    return <PageLoader message="Loading..." primaryColor="#000000" backgroundColor="#f9fafb" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-xl font-semibold">My Orders</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {loading ? (
          <div className="py-20">
            <InlineLoader message="Loading your orders..." primaryColor="#000000" size="md" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Could not load orders</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">You haven't placed any orders yet.</h3>
            <p className="text-gray-500 mb-6">When you do, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-lg">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-gray-800">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        From: <span className="font-medium text-gray-700">{order.storeName}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex gap-4 mb-4 border-t border-b py-4">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 border">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600 border">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-lg text-gray-900">LKR {order.total.toFixed(2)}</p>
                  </div>
                  <Link
                    href={`/buyer/track-order/${order.id}`}
                    className="px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}