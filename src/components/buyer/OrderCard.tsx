'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Order } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

type OrderCardProps = {
  order: Order;
};

const getStatusConfig = (status: string, theme: string) => {
  const configs = {
    classic: {
      pending: 'bg-amber-50 text-amber-800 border border-amber-200',
      processing: 'bg-blue-50 text-blue-800 border border-blue-200',
      shipped: 'bg-purple-50 text-purple-800 border border-purple-200',
      delivered: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      cancelled: 'bg-red-50 text-red-800 border border-red-200',
    },
    modern: {
      pending: 'bg-yellow-100 text-yellow-900',
      processing: 'bg-blue-100 text-blue-900',
      shipped: 'bg-indigo-100 text-indigo-900',
      delivered: 'bg-green-100 text-green-900',
      cancelled: 'bg-red-100 text-red-900',
    },
    minimalist: {
      pending: 'bg-gray-100 text-gray-900 border border-gray-300',
      processing: 'bg-gray-200 text-gray-900 border border-gray-400',
      shipped: 'bg-gray-300 text-gray-900 border border-gray-500',
      delivered: 'bg-black text-white',
      cancelled: 'bg-white text-black border-2 border-black',
    },
    bold: {
      pending: 'bg-yellow-400 text-black font-bold',
      processing: 'bg-cyan-400 text-black font-bold',
      shipped: 'bg-purple-500 text-white font-bold',
      delivered: 'bg-green-400 text-black font-bold',
      cancelled: 'bg-red-500 text-white font-bold',
    },
  };

  return configs[theme as keyof typeof configs]?.[status as keyof typeof configs.classic] || configs.modern.pending;
};

export function OrderCard({ order }: OrderCardProps) {
  const { theme } = useTheme();
  const cardStyles = {
    classic: {
      container: 'bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all',
      header: 'p-6 border-b border-gray-200',
      orderNumber: 'font-serif text-xl font-semibold text-gray-800',
      storeName: 'text-sm text-gray-600 mt-1 font-serif',
      date: 'text-xs text-gray-500 mt-1',
      itemsGrid: 'flex gap-3 px-6 py-4 bg-gray-50',
      itemImage: 'w-20 h-20 bg-gray-100 rounded-md border border-gray-200',
      footer: 'px-6 py-4 bg-white flex items-center justify-between border-t border-gray-200',
      totalLabel: 'text-sm text-gray-600 font-serif',
      totalAmount: 'font-serif text-2xl font-bold text-gray-900',
      button: 'px-6 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2',
    },
    modern: {
      container: 'bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30',
      header: 'p-6',
      orderNumber: 'text-xl font-bold text-gray-900',
      storeName: 'text-sm text-blue-600 mt-1 font-semibold',
      date: 'text-xs text-gray-500 mt-1',
      itemsGrid: 'flex gap-3 px-6 py-4',
      itemImage: 'w-24 h-24 bg-white/50 rounded-xl border-2 border-white/30',
      footer: 'px-6 py-5 bg-white/50 flex items-center justify-between',
      totalLabel: 'text-sm text-gray-600 font-medium',
      totalAmount: 'text-3xl font-bold text-gray-900',
      button: 'px-6 py-3 bg-blue-500 text-white text-sm font-bold rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md',
    },
    minimalist: {
      container: 'bg-white border border-gray-300 overflow-hidden hover:border-black transition-all',
      header: 'p-6',
      orderNumber: 'text-lg font-semibold text-black tracking-wide',
      storeName: 'text-sm text-gray-700 mt-1',
      date: 'text-xs text-gray-500 mt-1',
      itemsGrid: 'flex gap-3 px-6 py-4 border-t border-b border-gray-200',
      itemImage: 'w-20 h-20 bg-gray-50 border border-gray-200',
      footer: 'px-6 py-4 flex items-center justify-between',
      totalLabel: 'text-xs text-gray-600 uppercase tracking-wide',
      totalAmount: 'text-xl font-semibold text-black',
      button: 'px-5 py-2 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-all flex items-center gap-2',
    },
    bold: {
      container: 'bg-black border-4 border-yellow-400 overflow-hidden hover:border-cyan-400 transition-all transform hover:-translate-y-1',
      header: 'p-6 bg-gradient-to-r from-black to-gray-900',
      orderNumber: 'text-2xl font-black text-yellow-400 uppercase tracking-wider',
      storeName: 'text-sm text-white mt-2 font-mono uppercase',
      date: 'text-xs text-gray-400 mt-1 font-mono',
      itemsGrid: 'flex gap-4 px-6 py-5 bg-gray-900',
      itemImage: 'w-24 h-24 bg-black rounded-lg border-2 border-yellow-400',
      footer: 'px-6 py-5 bg-black flex items-center justify-between border-t-4 border-yellow-400',
      totalLabel: 'text-xs text-yellow-400 font-mono uppercase tracking-widest',
      totalAmount: 'text-3xl font-black text-white font-mono',
      button: 'px-6 py-3 bg-yellow-400 text-black text-sm font-black rounded-md hover:bg-cyan-400 transition-all uppercase tracking-wide flex items-center gap-2',
    },
  };

  const styles = cardStyles[theme];
  const statusClass = getStatusConfig(order.status, theme);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className={styles.orderNumber}>Order #{order.orderNumber}</h3>
            <p className={styles.storeName}>{order.storeName}</p>
            <p className={styles.date}>
              {order.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) || 'Recent'}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className={styles.itemsGrid}>
        {order.items.slice(0, 4).map((item, idx) => (
          <div key={idx} className={styles.itemImage}>
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {order.items.length > 4 && (
          <div className={`${styles.itemImage} flex items-center justify-center`}>
            <span className={theme === 'bold' ? 'text-yellow-400 font-black text-lg' : 'text-gray-600 font-semibold'}>
              +{order.items.length - 4}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div>
          <p className={styles.totalLabel}>Total</p>
          <p className={styles.totalAmount}>LKR {order.total.toFixed(2)}</p>
        </div>
        <Link href={`/buyer/track-order/${order.id}`} className={styles.button}>
          Track Order
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}