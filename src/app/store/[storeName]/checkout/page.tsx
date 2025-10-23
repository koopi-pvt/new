'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { collection, serverTimestamp, runTransaction, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import { ArrowLeft, Package, User, MapPin, CreditCard, Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/contexts/StoreContext';
import { ButtonLoader } from '@/components/ui/ButtonLoader';
import { useTheme } from '@/contexts/ThemeContext';
import DiscountCodeInput from '@/components/DiscountCodeInput';

type CheckoutStep = 'auth' | 'shipping' | 'review';

type ShippingInfo = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const storeName = params.storeName as string;
  const { items, getSubtotal, getDiscount, getTotal, appliedDiscount, applyDiscount, removeDiscount, clearCart } = useCart();
  const { buyer, buyerProfile } = useBuyerAuth();
  const { storeData, loading: themeLoading } = useStore();
  const { theme, setTheme, themeStyles } = useTheme();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('auth');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: buyerProfile?.name || '',
    email: buyerProfile?.email || '',
    phone: buyerProfile?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set page title dynamically
  useEffect(() => {
    if (storeData) {
      document.title = `Checkout - ${storeData.storeName}`;
    }
  }, [storeData]);

  useEffect(() => {
    // If cart is empty, redirect back to store
    if (items.length === 0) {
      router.push(`/store/${storeName}`);
      return;
    }

    // If buyer is logged in, skip to shipping step
    if (buyer && buyerProfile) {
      setCurrentStep('shipping');
      setShippingInfo((prev) => ({
        ...prev,
        name: buyerProfile.name,
        email: buyerProfile.email,
        phone: buyerProfile.phone || '',
      }));
    }
  }, [buyer, buyerProfile, items.length, storeName, router]);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = appliedDiscount?.discountType === 'free_shipping' ? 0 : 0; // Free shipping if discount type or base
  const tax = 0; // No tax calculation for now
  const total = Math.max(0, subtotal - discount + shipping + tax);


  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!shippingInfo.name.trim() || !shippingInfo.email.trim() || !shippingInfo.phone.trim()) {
      setError('Please fill in all required contact fields');
      return;
    }
    if (!shippingInfo.addressLine1.trim() || !shippingInfo.city.trim() || 
        !shippingInfo.state.trim() || !shippingInfo.zipCode.trim()) {
      setError('Please fill in all required address fields');
      return;
    }

    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    const orderRef = doc(collection(db, 'orders'));

    try {
      let orderData: any;
     await runTransaction(db, async (transaction) => {
       // 1. Prepare order data
       orderData = {
         orderNumber: `ORD-${Date.now()}`,
         status: 'pending',
         paymentMethod: 'cod',
          paymentStatus: 'pending',
          buyerId: buyer?.uid || null,
          buyerEmail: shippingInfo.email,
          isGuest: !buyer,
          shippingAddress: { ...shippingInfo },
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || null,
            storeId: item.storeId,
            storeName: item.storeName,
            variant: item.variant || null,
          })),
          discount: appliedDiscount || null,
          storeId: items.length > 0 ? items[0].storeId : null,
          storeName: storeName,
          subtotal,
          shipping,
          tax,
          total,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // 1.5. Update promotion usage if discount applied
        if (appliedDiscount) {
          const promotionRef = doc(db, 'promotions', appliedDiscount.promotionId);
          transaction.update(promotionRef, {
            currentUses: increment(1),
            usageHistory: arrayUnion({
              buyerId: buyer?.uid || null,
              buyerEmail: shippingInfo.email,
              orderId: orderRef.id,
              usedAt: new Date(),
            }),
            updatedAt: serverTimestamp(),
          });
        }

        // 2. Update stock for each item
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Product "${item.name}" is no longer available.`);
          }

          const productData = productDoc.data();
          
          // Check if inventory tracking is enabled
          if (productData.inventory !== undefined && productData.inventory !== null) {
            const newInventory = productData.inventory - item.quantity;
            if (newInventory < 0) {
              throw new Error(`Not enough stock for "${item.name}". Only ${productData.inventory} left.`);
            }
            transaction.update(productRef, { inventory: newInventory });
          }
        }

        // 3. Create the order
        transaction.set(orderRef, orderData);
      });

      // If transaction is successful
     
     // Send order confirmation email
    try {
      const emailData = {
        to: shippingInfo.email,
        template: 'orderConfirmation',
        data: {
          orderNumber: orderData.orderNumber,
          total: total,
          shippingName: shippingInfo.name,
          shippingAddress: `
            ${shippingInfo.addressLine1}
            ${shippingInfo.addressLine2 ? `\n${shippingInfo.addressLine2}` : ''}
            \n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}
            \n${shippingInfo.country}
          `,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          storeName: storeName,
        }
      };

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
    } catch (emailError) {
       console.error("Failed to send confirmation email:", emailError);
       // Don't block the user flow if email fails. Just log it.
     }

     clearCart();
     router.push(`/store/${storeName}/order-confirmation/${orderRef.id}`);

   } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // Auth Step
  if (currentStep === 'auth' && !buyer) {
    const theme = storeData?.website?.theme || {
      primaryColor: '#000000',
      accentColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'inter'
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        {/* Header */}
        <div style={{ backgroundColor: theme.backgroundColor, borderBottom: `1px solid ${theme.textColor}20` }}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/store/${storeName}`} className="inline-flex items-center gap-2" style={{ color: theme.textColor }}>
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Store</span>
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: theme.textColor }}>Checkout</h1>
            <p className="text-lg" style={{ color: theme.textColor, opacity: 0.7 }}>Sign in to continue</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ backgroundColor: theme.backgroundColor, boxShadow: `0 10px 25px -5px ${theme.primaryColor}1A` }}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor + '1A' }}>
                  <User className="w-8 h-8" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: theme.textColor }}>Have an Account?</h3>
                <p className="mb-8" style={{ color: theme.textColor, opacity: 0.7 }}>Sign in for faster checkout and order tracking.</p>
                <Link
                  href={`/buyer/login?returnUrl=${encodeURIComponent(`/store/${storeName}/checkout`)}`}
                  className="block w-full py-3.5 rounded-lg font-semibold transition-transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
                >
                  Sign In
                </Link>
                <Link
                  href={`/buyer/register?returnUrl=${encodeURIComponent(`/store/${storeName}/checkout`)}`}
                  className="block w-full py-3.5 mt-4 rounded-lg font-semibold border transition-colors"
                  style={{ borderColor: theme.textColor + '30', color: theme.textColor, backgroundColor: 'transparent' }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shipping Step
  if (currentStep === 'shipping') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
        {/* macOS-style background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/store/${storeName}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Store</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Information</h1>
            <p className="text-gray-600">Enter your delivery details</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleShippingSubmit} className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        value={shippingInfo.addressLine1}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={shippingInfo.addressLine2}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                        placeholder="Apt, suite, unit, etc. (optional)"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input
                          type="text"
                          value={shippingInfo.country}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md active:scale-95"
                >
                  Continue to Review
                </button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sticky top-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                <div className="space-y-3">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 bg-white/50 rounded flex-shrink-0 border border-gray-200/50">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-500 truncate">
                            {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </p>
                        )}
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-sm text-gray-600">+{items.length - 3} more items</p>
                  )}
                </div>

                {/* Discount Code Input */}
                <div className="border-t border-gray-200/50 pt-4">
                  <DiscountCodeInput
                    storeId={storeData?.ownerId || ''}
                    storeName={storeName}
                    cartSubtotal={subtotal}
                    cartItems={items}
                    onDiscountApplied={applyDiscount}
                    currentDiscount={appliedDiscount ? {
                      code: appliedDiscount.code,
                      discountAmount: discount,
                    } : null}
                    onDiscountRemoved={removeDiscount}
                  />
                </div>

                <div className="border-t border-gray-200/50 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span className="font-medium">-LKR {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200/50 pt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Step
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => setCurrentStep('shipping')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Shipping</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Order</h1>
          <p className="text-gray-600">Please review your order before placing it</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                <button
                  onClick={() => setCurrentStep('shipping')}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Edit
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{shippingInfo.name}</p>
                <p>{shippingInfo.addressLine1}</p>
                {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p>{shippingInfo.country}</p>
                <p className="pt-2">{shippingInfo.phone}</p>
                <p>{shippingInfo.email}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h3>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items ({items.length})</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />}
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
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span className="font-medium">-LKR {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">LKR {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>LKR {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <ButtonLoader color="#ffffff" size="md" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
