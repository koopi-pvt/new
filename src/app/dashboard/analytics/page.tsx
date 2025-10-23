"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';
import { BarChart, TrendingUp, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = 'Analytics - Koopi Dashboard';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <PageLoader message="Loading analytics..." primaryColor="#000000" backgroundColor="#f1f1f1" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
              <BarChart className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Analytics</h1>
              <p className="text-sm text-gray-600 mt-0.5">Track your store performance and insights</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 lg:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BarChart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Analytics Dashboard Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              We're building powerful analytics features to help you understand your business better.
            </p>
            
            {/* Feature Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Sales Trends</p>
                <p className="text-xs text-gray-500 mt-1">Track revenue over time</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Product Performance</p>
                <p className="text-xs text-gray-500 mt-1">Best sellers & insights</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Customer Behavior</p>
                <p className="text-xs text-gray-500 mt-1">Shopping patterns</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Revenue Reports</p>
                <p className="text-xs text-gray-500 mt-1">Detailed breakdowns</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> High priority feature - Coming in Q3 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
