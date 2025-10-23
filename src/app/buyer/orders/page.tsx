'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Package, User, LogOut, ArrowLeft, ShoppingBag, Filter } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/PageLoader';
import { InlineLoader } from '@/components/ui/InlineLoader';
import { OrderCard } from '@/components/buyer/OrderCard';
import { Order } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function BuyerOrdersPage() {
  const router = useRouter();
  const { buyer, buyerProfile, logout, loading: authLoading } = useBuyerAuth();
  const { theme, setTheme } = useTheme();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !buyer) {
      router.push('/buyer/login?returnUrl=/buyer/orders');
      return;
    }

    if (buyer) {
      fetchOrders();
    }
  }, [buyer, authLoading, router]);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filterStatus));
    }
  }, [filterStatus, orders]);

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
      setFilteredOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load orders. Please try again later.');
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

  const getThemeStyles = (theme: string) => {
    const styles = {
      classic: {
        bg: 'bg-gradient-to-br from-amber-50 via-white to-gray-50',
        header: 'bg-white border-b-2 border-gray-200',
        title: 'font-serif text-2xl font-bold text-gray-800',
        filterBtn: 'px-4 py-2 border-2 border-gray-300 rounded-md hover:border-gray-800 transition-colors font-serif',
        filterBtnActive: 'px-4 py-2 border-2 border-gray-800 bg-gray-800 text-white rounded-md font-serif',
        emptyCard: 'bg-white border-2 border-gray-200 rounded-lg',
      },
      modern: {
        bg: 'bg-[#f5f5f7]',
        header: 'bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg',
        title: 'text-2xl font-bold text-gray-900',
        filterBtn: 'px-4 py-2 bg-white/80 text-gray-700 rounded-full hover:bg-white transition-all font-medium border border-gray-200/80',
        filterBtnActive: 'px-4 py-2 bg-blue-500 text-white rounded-full font-semibold shadow-md',
        emptyCard: 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30',
      },
      minimalist: {
        bg: 'bg-white',
        header: 'bg-white border-b border-gray-300',
        title: 'text-xl font-semibold text-black tracking-wide',
        filterBtn: 'px-4 py-2 border border-gray-400 text-black hover:border-black transition-all',
        filterBtnActive: 'px-4 py-2 border-2 border-black bg-black text-white',
        emptyCard: 'bg-white border border-gray-300',
      },
      bold: {
        bg: 'bg-black',
        header: 'bg-black border-b-4 border-yellow-400',
        title: 'text-2xl font-black text-yellow-400 uppercase tracking-wider',
        filterBtn: 'px-4 py-2 border-2 border-yellow-400 text-yellow-400 rounded-md hover:bg-yellow-400 hover:text-black transition-all font-bold uppercase',
        filterBtnActive: 'px-4 py-2 bg-yellow-400 text-black rounded-md font-black uppercase',
        emptyCard: 'bg-gray-900 border-4 border-yellow-400',
      },
    };
    return styles[theme as keyof typeof styles] || styles.modern;
  };

  const themeStyles = getThemeStyles(theme);

  if (authLoading || !buyer) {
    return <PageLoader message="Loading..." primaryColor="#000000" backgroundColor="#f9fafb" />;
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      {/* Header */}
      <header className={`${themeStyles.header} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className={`flex items-center gap-2 ${theme === 'bold' ? 'text-yellow-400' : theme === 'minimalist' ? 'text-black' : 'text-gray-600'} hover:opacity-70 transition-opacity`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <h1 className={themeStyles.title}>
              <ShoppingBag className="w-6 h-6 inline-block mr-2 mb-1" />
              My Orders
            </h1>
            
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 ${theme === 'bold' ? 'text-yellow-400 hover:text-cyan-400' : theme === 'minimalist' ? 'text-black hover:opacity-70' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* Status Filter */}
        <div className="mb-8 flex items-center justify-end">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { label: 'All', value: 'all', count: statusCounts.all },
              { label: 'Pending', value: 'pending', count: statusCounts.pending },
              { label: 'Processing', value: 'processing', count: statusCounts.processing },
              { label: 'Shipped', value: 'shipped', count: statusCounts.shipped },
              { label: 'Delivered', value: 'delivered', count: statusCounts.delivered },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-all ${
                  filterStatus === filter.value
                    ? themeStyles.filterBtnActive
                    : themeStyles.filterBtn
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <InlineLoader message="Loading your orders..." primaryColor="#000000" size="md" />
          </div>
        ) : error ? (
          <div className={`${theme === 'bold' ? 'bg-red-900 border-4 border-red-500 text-white' : 'bg-red-100 border border-red-300 text-red-800'} rounded-lg p-6 text-center`}>
            <h3 className="font-semibold mb-2">Could not load orders</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`${themeStyles.emptyCard} text-center py-20 px-6`}>
            <Package className={`w-16 h-16 mx-auto mb-4 ${theme === 'bold' ? 'text-yellow-400' : theme === 'minimalist' ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'bold' ? 'text-yellow-400' : theme === 'minimalist' ? 'text-black' : 'text-gray-800'}`}>
              {filterStatus === 'all' ? "You haven't placed any orders yet." : `No ${filterStatus} orders found.`}
            </h3>
            <p className={`${theme === 'bold' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              {filterStatus === 'all' ? "When you do, they will appear here." : "Try selecting a different filter."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
