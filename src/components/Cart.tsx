'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, ShoppingCart, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function Cart() {
  const router = useRouter();
  const params = useParams();
  const { items, removeFromCart, updateQuantity, getSubtotal, getDiscount, getTotal, appliedDiscount, removeDiscount, isCartOpen, setIsCartOpen } = useCart();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  
  // Extract store name from current URL if available
  const storeName = params?.storeName as string || (items.length > 0 ? items[0].storeName : null);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white/80 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 180px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 text-sm mb-4">Add products to get started</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md active:scale-95"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-white/50 border border-gray-200/50 rounded-xl p-3 shadow-sm">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.storeName}</p>
                    {item.variant && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.variant).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      LKR {item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100/50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100/50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1.5 text-red-600 hover:bg-red-100/50 rounded-full transition-colors"
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Discount */}
        {items.length > 0 && (
          <div className="border-t border-gray-200/50 p-4 bg-white/50">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">LKR {subtotal.toFixed(2)}</span>
              </div>
              
              {appliedDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Discount ({appliedDiscount.code})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">-LKR {discount.toFixed(2)}</span>
                    <button
                      onClick={removeDiscount}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="text-xl font-bold text-gray-900">LKR {total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md active:scale-95"
              onClick={() => {
                if (storeName) {
                  setIsCartOpen(false);
                  router.push(`/store/${storeName}/checkout`);
                } else {
                  alert('Unable to proceed to checkout. Please return to the store.');
                }
              }}
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2 mt-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
