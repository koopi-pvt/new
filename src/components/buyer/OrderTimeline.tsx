'use client';

import React from 'react';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';

import { useTheme } from '@/contexts/ThemeContext';

type OrderTimelineProps = {
  currentStatus: string;
};

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const { theme } = useTheme();
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);

  const statusSteps = [
    { label: 'Order Placed', status: 'pending', icon: Package, completed: currentIndex >= 0 },
    { label: 'Processing', status: 'processing', icon: Clock, completed: currentIndex >= 1 },
    { label: 'Shipped', status: 'shipped', icon: Truck, completed: currentIndex >= 2 },
    { label: 'Delivered', status: 'delivered', icon: CheckCircle, completed: currentIndex >= 3 },
  ];

  const themeStyles = {
    classic: {
      container: 'bg-white border-2 border-gray-200 rounded-lg p-8',
      title: 'text-xl font-serif font-semibold text-gray-800 mb-8',
      progressLine: 'bg-amber-100',
      progressFill: 'bg-amber-600',
      completedCircle: 'bg-amber-600 text-white',
      pendingCircle: 'bg-gray-200 text-gray-400',
      completedLabel: 'text-gray-900 font-serif',
      pendingLabel: 'text-gray-500',
    },
    modern: {
      container: 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/30',
      title: 'text-2xl font-bold text-gray-900 mb-8',
      progressLine: 'bg-white/50',
      progressFill: 'bg-gradient-to-r from-blue-500 to-green-500',
      completedCircle: 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg',
      pendingCircle: 'bg-white/80 text-gray-400 border border-gray-200/50',
      completedLabel: 'text-gray-900 font-semibold',
      pendingLabel: 'text-gray-500',
    },
    minimalist: {
      container: 'bg-white border border-gray-300 p-8',
      title: 'text-lg font-semibold text-black mb-8 tracking-wide',
      progressLine: 'bg-gray-300',
      progressFill: 'bg-black',
      completedCircle: 'bg-black text-white',
      pendingCircle: 'bg-white text-gray-400 border-2 border-gray-300',
      completedLabel: 'text-black font-medium',
      pendingLabel: 'text-gray-500',
    },
    bold: {
      container: 'bg-gray-900 border-4 border-yellow-400 p-8',
      title: 'text-2xl font-black text-yellow-400 uppercase tracking-wider mb-8',
      progressLine: 'bg-gray-700',
      progressFill: 'bg-gradient-to-r from-yellow-400 to-cyan-400',
      completedCircle: 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/50',
      pendingCircle: 'bg-gray-800 text-gray-600 border-2 border-gray-700',
      completedLabel: 'text-white font-bold font-mono uppercase',
      pendingLabel: 'text-gray-600 font-mono',
    },
  };

  const styles = themeStyles[theme];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Order Status</h2>
      
      <div className="relative">
        {/* Progress Line */}
        <div className={`absolute top-6 left-6 right-6 h-1 ${styles.progressLine} rounded-full`}>
          <div
            className={`h-full ${styles.progressFill} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${(statusSteps.filter(s => s.completed).length - 1) * 33.33}%` }}
          />
        </div>

        {/* Status Steps */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    step.completed ? styles.completedCircle : styles.pendingCircle
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`text-xs sm:text-sm text-center font-medium transition-colors ${
                  step.completed ? styles.completedLabel : styles.pendingLabel
                }`}>
                  {step.label}
                </p>
                {theme === 'modern' && step.completed && (
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">Completed</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
