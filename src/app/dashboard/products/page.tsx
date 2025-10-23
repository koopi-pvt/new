"use client";

import { PlusCircle, Package, Edit, Trash2 } from "lucide-react";
import ProductTableSkeleton from "@/components/dashboard/ProductTableSkeleton";
import Link from "next/link";
import { useState, useEffect } from "react";
import Confetti from 'react-confetti';
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

type Product = {
  id: string;
  name: string;
  status: "Active" | "Draft";
  inventory: number;
  type: string;
  vendor: string;
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    if (user) {
      try {
        setLoading(true);
        const q = query(collection(db, "products"), where("storeId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
              <Package className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Products</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage your inventory and product listings</p>
            </div>
          </div>
          <Link
            href="/dashboard/products/new"
            className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-12">
            <ProductTableSkeleton />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200/50 bg-white/50">
                  <th className="p-4">PRODUCT</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">INVENTORY</th>
                  <th className="p-4 hidden md:table-cell">TYPE</th>
                  <th className="p-4 hidden md:table-cell">VENDOR</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200/30 hover:bg-white/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.inventory} <span className="hidden sm:inline">in stock</span></td>
                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{product.type}</td>
                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{product.vendor}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/products/${product.id}`}
                          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-12">
            <div className="max-w-2xl mx-auto text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add your first product</h2>
              <p className="text-gray-600 mb-6">
                Start by stocking your store with products your customers will love.
              </p>
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-md active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;