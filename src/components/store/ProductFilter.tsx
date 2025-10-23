'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, TrendingUp } from 'lucide-react';
import { Product } from '@/types';

type FilterProps = {
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor?: string;
    textColor: string;
    fontFamily?: string;
  };
  categories: string[];
  products: Product[];
  onFilterChange: (filters: FilterState) => void;
  totalProducts: number;
  filteredCount: number;
};

export type FilterState = {
  searchTerm: string;
  category: string;
  priceRange: string;
  sortBy: string;
};

export function ProductFilter({ theme, categories, products, onFilterChange, totalProducts, filteredCount }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: '',
    priceRange: '',
    sortBy: 'newest',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Array<{ type: 'product' | 'category'; name: string; category?: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      searchTerm: '',
      category: '',
      priceRange: '',
      sortBy: 'newest',
    };
    setFilters(cleared);
    onFilterChange(cleared);
    setShowAutocomplete(false);
  };

  // Autocomplete logic
  useEffect(() => {
    if (filters.searchTerm.trim().length > 0) {
      const searchLower = filters.searchTerm.toLowerCase();
      const results: Array<{ type: 'product' | 'category'; name: string; category?: string }> = [];

      // Add matching products
      products.forEach(product => {
        if (product.name?.toLowerCase().includes(searchLower)) {
          results.push({
            type: 'product',
            name: product.name,
            category: product.category,
          });
        }
      });

      // Add matching categories
      categories.forEach(cat => {
        if (cat.toLowerCase().includes(searchLower)) {
          results.push({
            type: 'category',
            name: cat,
          });
        }
      });

      setAutocompleteResults(results.slice(0, 8)); // Limit to 8 results
      setShowAutocomplete(results.length > 0);
    } else {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
    }
  }, [filters.searchTerm, products, categories]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAutocompleteClick = (result: typeof autocompleteResults[0]) => {
    if (result.type === 'product') {
      updateFilters({ searchTerm: result.name });
    } else {
      updateFilters({ searchTerm: '', category: result.name });
    }
    setShowAutocomplete(false);
  };

  const hasActiveFilters = filters.searchTerm || filters.category || filters.priceRange;

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Search Bar with Autocomplete */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative" ref={searchRef}>
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 z-10" 
            style={{ color: theme.textColor, opacity: 0.5 }}
          />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            onFocus={() => filters.searchTerm && setShowAutocomplete(true)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.backgroundColor || '#ffffff',
              color: theme.textColor,
              borderColor: theme.textColor + '20',
            }}
            onFocusCapture={(e) => e.target.style.borderColor = theme.primaryColor}
            onBlur={(e) => {
              setTimeout(() => setShowAutocomplete(false), 200);
              e.target.style.borderColor = theme.textColor + '20';
            }}
          />

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 rounded-lg border-2 shadow-lg z-50 max-h-64 overflow-y-auto"
              style={{
                backgroundColor: theme.backgroundColor || '#ffffff',
                borderColor: theme.textColor + '20',
              }}
            >
              {autocompleteResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleAutocompleteClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-opacity-10 transition-colors border-b last:border-b-0"
                  style={{
                    color: theme.textColor,
                    borderColor: theme.textColor + '10',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryColor + '10'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex items-center gap-3">
                    {result.type === 'category' ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
                      >
                        CAT
                      </div>
                    ) : (
                      <Search className="w-4 h-4" style={{ color: theme.textColor, opacity: 0.5 }} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.name}</p>
                      {result.category && (
                        <p className="text-xs" style={{ color: theme.textColor, opacity: 0.6 }}>
                          in {result.category}
                        </p>
                      )}
                    </div>
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: result.type === 'category' ? theme.primaryColor + '20' : theme.textColor + '10',
                        color: result.type === 'category' ? theme.primaryColor : theme.textColor 
                      }}
                    >
                      {result.type === 'category' ? 'Category' : 'Product'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: showFilters ? theme.primaryColor : (theme.backgroundColor || '#ffffff'),
            color: showFilters ? '#ffffff' : theme.textColor,
            borderColor: theme.primaryColor,
          }}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div 
          className="p-5 rounded-lg border-2 space-y-4 animate-in fade-in slide-in-from-top-2"
          style={{
            backgroundColor: theme.backgroundColor || '#ffffff',
            borderColor: theme.textColor + '20',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.backgroundColor || '#ffffff',
                    color: theme.textColor,
                    borderColor: theme.textColor + '30',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                  onBlur={(e) => e.target.style.borderColor = theme.textColor + '30'}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: theme.textColor, opacity: 0.5 }}
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
                Price Range
              </label>
              <div className="relative">
                <select
                  value={filters.priceRange}
                  onChange={(e) => updateFilters({ priceRange: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.backgroundColor || '#ffffff',
                    color: theme.textColor,
                    borderColor: theme.textColor + '30',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                  onBlur={(e) => e.target.style.borderColor = theme.textColor + '30'}
                >
                  <option value="">All Prices</option>
                  <option value="0-10">Under $10</option>
                  <option value="10-50">$10 - $50</option>
                  <option value="50-999999">$50+</option>
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: theme.textColor, opacity: 0.5 }}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
                Sort By
              </label>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.backgroundColor || '#ffffff',
                    color: theme.textColor,
                    borderColor: theme.textColor + '30',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                  onBlur={(e) => e.target.style.borderColor = theme.textColor + '30'}
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: theme.textColor, opacity: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.textColor + '10',
                  color: theme.textColor,
                }}
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.7 }}>
          {filteredCount === totalProducts 
            ? `Showing all ${totalProducts} products` 
            : `Showing ${filteredCount} of ${totalProducts} products`
          }
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium underline hover:no-underline transition-all"
            style={{ color: theme.primaryColor }}
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
