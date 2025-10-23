'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Tags, PlusCircle, Search, Edit, Trash2, Copy, Calendar, TrendingUp, Users, CheckCircle, XCircle, Package, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Promotion, Product } from '@/types';
import withAuth from '@/components/withAuth';

function PromotionsPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    discountValue: 0,
    applicationType: 'entire_order' as 'entire_order' | 'specific_products',
    applicableProductIds: [] as string[],
    minPurchaseAmount: undefined as number | undefined,
    startDate: '',
    endDate: '',
    maxTotalUses: undefined as number | undefined,
    maxUsesPerCustomer: undefined as number | undefined,
    newProductsOnly: false,
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      fetchPromotions();
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    filterPromotions();
  }, [promotions, searchQuery, statusFilter]);

  const fetchPromotions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'promotions'), where('storeId', '==', user.uid));
      const snapshot = await getDocs(q);
      const promotionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Promotion[];
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'products'), where('storeId', '==', user.uid));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterPromotions = () => {
    let filtered = [...promotions];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(promo => promo.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(promo => !promo.isActive);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(promo =>
        promo.code.toLowerCase().includes(query) ||
        promo.name.toLowerCase().includes(query)
      );
    }

    setFilteredPromotions(filtered);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const promotionData = {
        storeId: user.uid,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        applicationType: formData.applicationType,
        applicableProductIds: formData.applicationType === 'specific_products' ? formData.applicableProductIds : [],
        conditions: {
          minPurchaseAmount: formData.minPurchaseAmount || null,
          startDate: formData.startDate ? Timestamp.fromDate(new Date(formData.startDate)) : null,
          endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
          maxTotalUses: formData.maxTotalUses || null,
          maxUsesPerCustomer: formData.maxUsesPerCustomer || null,
          newProductsOnly: formData.newProductsOnly,
        },
        currentUses: 0,
        usageHistory: [],
        isActive: formData.isActive,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (editingPromotion) {
        await updateDoc(doc(db, 'promotions', editingPromotion.id), {
          ...promotionData,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, 'promotions'), promotionData);
      }

      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Failed to save promotion. Please try again.');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || '',
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      applicationType: promotion.applicationType,
      applicableProductIds: promotion.applicableProductIds || [],
      minPurchaseAmount: promotion.conditions.minPurchaseAmount,
      startDate: promotion.conditions.startDate ? new Date(promotion.conditions.startDate.toDate()).toISOString().slice(0, 16) : '',
      endDate: promotion.conditions.endDate ? new Date(promotion.conditions.endDate.toDate()).toISOString().slice(0, 16) : '',
      maxTotalUses: promotion.conditions.maxTotalUses,
      maxUsesPerCustomer: promotion.conditions.maxUsesPerCustomer,
      newProductsOnly: promotion.conditions.newProductsOnly || false,
      isActive: promotion.isActive,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deleteDoc(doc(db, 'promotions', id));
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const toggleStatus = async (promotion: Promotion) => {
    try {
      await updateDoc(doc(db, 'promotions', promotion.id), {
        isActive: !promotion.isActive,
        updatedAt: Timestamp.now(),
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      applicationType: 'entire_order',
      applicableProductIds: [],
      minPurchaseAmount: undefined,
      startDate: '',
      endDate: '',
      maxTotalUses: undefined,
      maxUsesPerCustomer: undefined,
      newProductsOnly: false,
      isActive: true,
    });
    setEditingPromotion(null);
    setShowCreateModal(false);
  };

  const getDiscountDisplay = (promo: Promotion) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% OFF`;
    } else if (promo.discountType === 'fixed') {
      return `LKR ${promo.discountValue} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  const isPromotionActive = (promo: Promotion) => {
    if (!promo.isActive) return false;
    const now = new Date();
    if (promo.conditions.startDate && promo.conditions.startDate.toDate() > now) return false;
    if (promo.conditions.endDate && promo.conditions.endDate.toDate() < now) return false;
    if (promo.conditions.maxTotalUses && promo.currentUses >= promo.conditions.maxTotalUses) return false;
    return true;
  };

  const getPromotionStats = () => {
    return {
      total: promotions.length,
      active: promotions.filter(p => isPromotionActive(p)).length,
      expired: promotions.filter(p => p.conditions.endDate && p.conditions.endDate.toDate() < new Date()).length,
      used: promotions.reduce((sum, p) => sum + p.currentUses, 0),
    };
  };

  const stats = getPromotionStats();

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
              <Tags className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Promotions</h1>
              <p className="text-sm text-gray-600 mt-0.5">Create and manage discount codes</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Promotion
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Tags className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.used}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'active', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all capitalize ${
                    statusFilter === status
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Promotions List */}
        {loading ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-12">
            <div className="text-center text-gray-600">Loading promotions...</div>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-12">
            <div className="max-w-2xl mx-auto text-center">
              <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {promotions.length === 0 ? 'Create your first promotion' : 'No promotions found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {promotions.length === 0
                  ? 'Start attracting customers with discount codes and special offers.'
                  : 'Try adjusting your search or filters'}
              </p>
              {promotions.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-md active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Promotion
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPromotions.map((promo) => {
              const isActive = isPromotionActive(promo);
              return (
                <div
                  key={promo.id}
                  className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-xl p-5 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{promo.name}</h3>
                        {isActive ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-sm font-bold rounded-lg border border-blue-200">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="p-1 hover:bg-white/80 rounded-lg transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-purple-600">{getDiscountDisplay(promo)}</span>
                    </div>
                    
                    {promo.applicationType === 'specific_products' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{promo.applicableProductIds?.length || 0} specific products</span>
                      </div>
                    )}
                    
                    {promo.conditions.minPurchaseAmount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Min: LKR {promo.conditions.minPurchaseAmount}</span>
                      </div>
                    )}
                    
                    {(promo.conditions.startDate || promo.conditions.endDate) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {promo.conditions.startDate && new Date(promo.conditions.startDate.toDate()).toLocaleDateString()}
                          {promo.conditions.startDate && promo.conditions.endDate && ' - '}
                          {promo.conditions.endDate && new Date(promo.conditions.endDate.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Used: {promo.currentUses}
                        {promo.conditions.maxTotalUses && ` / ${promo.conditions.maxTotalUses}`}
                      </span>
                    </div>
                    
                    {promo.conditions.newProductsOnly && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        ⭐ New Products Only
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => toggleStatus(promo)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        promo.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {promo.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {promo.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/95 rounded-[24px] border border-white/30 shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="SUMMER2025"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      title="Generate random code"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Summer Sale"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this promotion..."
                  rows={2}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                
                {formData.discountType !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount (LKR)'} *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      step="0.01"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Application Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applies To *
                </label>
                <select
                  value={formData.applicationType}
                  onChange={(e) => setFormData({ ...formData, applicationType: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="entire_order">Entire Order</option>
                  <option value="specific_products">Specific Products {products.length === 0 ? '(No products available)' : ''}</option>
                </select>
                
                {formData.applicationType === 'specific_products' && products.length === 0 && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-800 font-medium">No products available</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Create products first or switch to &quot;Entire Order&quot; to continue.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Selection */}
              {formData.applicationType === 'specific_products' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Products *
                  </label>
                  
                  {products.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">No Products Available</h3>
                          <p className="text-xs text-gray-600 mb-3">
                            You need to create products first before applying promotions to specific items.
                          </p>
                        </div>
                        <Link
                          href="/dashboard/products/new"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Create Your First Product
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="text-xs text-gray-500 mt-2">
                          Or switch to &quot;Entire Order&quot; to apply this promotion to all items
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                      {products.map(product => (
                        <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.applicableProductIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableProductIds: [...formData.applicableProductIds, product.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableProductIds: formData.applicableProductIds.filter(id => id !== product.id)
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conditions */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conditions & Limits</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Purchase Amount (LKR)
                    </label>
                    <input
                      type="number"
                      value={formData.minPurchaseAmount || ''}
                      onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Total Uses
                    </label>
                    <input
                      type="number"
                      value={formData.maxTotalUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxTotalUses: parseInt(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Uses Per Customer
                    </label>
                    <input
                      type="number"
                      value={formData.maxUsesPerCustomer || ''}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: parseInt(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newProductsOnly}
                      onChange={(e) => setFormData({ ...formData, newProductsOnly: e.target.checked })}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Apply only to new products</span>
                  </label>
                </div>
              </div>

              {/* Active Status */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Activate promotion immediately</span>
                </label>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formData.applicationType === 'specific_products' && (products.length === 0 || formData.applicableProductIds.length === 0)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-md transition-all ${
                  formData.applicationType === 'specific_products' && (products.length === 0 || formData.applicableProductIds.length === 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                }`}
              >
                {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PromotionsPage);
