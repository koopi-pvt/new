'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Package, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import withAuth from '@/components/withAuth';
import OrderTableSkeleton from '@/components/dashboard/OrderTableSkeleton';
import { Order } from '@/types';

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchStoreAndOrders();
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchStoreAndOrders = async () => {
    if (!user) return;

    try {
      // Get store name
      const storeDoc = await getDoc(doc(db, 'stores', user.uid));
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        setStoreName(storeData.storeName);

        // Fetch orders for this store
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('storeName', '==', storeData.storeName),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.shippingAddress.name.toLowerCase().includes(query) ||
        order.buyerEmail.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
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

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const stats = getOrderStats();

  const filterTabs = [
    { name: 'All', value: 'all', count: stats.total },
    { name: 'Pending', value: 'pending', count: stats.pending },
    { name: 'Processing', value: 'processing', count: stats.processing },
    { name: 'Shipped', value: 'shipped', count: stats.shipped },
    { name: 'Delivered', value: 'delivered', count: stats.delivered },
    { name: 'Cancelled', value: 'cancelled', count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header - macOS style */}
        <div className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
              <Package className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Orders</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage and track all customer orders</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  statusFilter === tab.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white/80'
                }`}
              >
                {tab.name}
              </button>
            ))}
            <div className="relative flex-1 ml-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search by order #, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6">
            <OrderTableSkeleton />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-12">
            <div className="max-w-2xl mx-auto text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h2>
              <p className="text-gray-600">
                {orders.length === 0
                  ? 'Orders will appear here when customers make purchases'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200/50 bg-white/50">
                  <th className="p-2 sm:p-4">ORDER</th>
                  <th className="p-2 sm:p-4 hidden sm:table-cell">CUSTOMER</th>
                  <th className="p-2 sm:p-4 hidden md:table-cell">ITEMS</th>
                  <th className="p-2 sm:p-4 hidden md:table-cell">TOTAL</th>
                  <th className="p-2 sm:p-4">STATUS</th>
                  <th className="p-2 sm:p-4 hidden md:table-cell">DATE</th>
                  <th className="p-2 sm:p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200/30 hover:bg-white/50 transition-colors">
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{order.shippingAddress.name}</p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden sm:table-cell">
                      <div>
                        <p className="text-sm text-gray-900">{order.shippingAddress.name}</p>
                        <p className="text-xs text-gray-500">{order.buyerEmail}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <p className="text-sm font-semibold text-gray-900">LKR {order.total.toFixed(2)}</p>
                    </td>
                    <td className="p-2 sm:p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-sm text-gray-600 hidden md:table-cell">
                      {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(OrdersPage);