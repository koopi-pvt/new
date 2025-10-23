'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Shield, User } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import { Review } from '@/types';

type ReviewListProps = {
  productId: string;
  theme: {
    primaryColor: string;
    textColor: string;
    backgroundColor?: string;
  };
};

export function ReviewList({ productId, theme }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReviews();
    
    // Load helpful clicks from localStorage
    const stored = localStorage.getItem(`helpful_${productId}`);
    if (stored) {
      setHelpfulClicked(new Set(JSON.parse(stored)));
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1)
      });

      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: (review.helpful || 0) + 1 }
          : review
      ));

      // Mark as clicked
      const newSet = new Set(helpfulClicked);
      newSet.add(reviewId);
      setHelpfulClicked(newSet);
      localStorage.setItem(`helpful_${productId}`, JSON.stringify([...newSet]));
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution.reverse(); // 5 stars first
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div 
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.primaryColor }}
        />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium" style={{ color: theme.textColor }}>No reviews yet</p>
        <p className="text-sm mt-1" style={{ color: theme.textColor, opacity: 0.6 }}>
          Be the first to review this product!
        </p>
      </div>
    );
  }

  const avgRating = getAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-lg bg-white/50 border border-gray-200/50">
        {/* Average Rating */}
        <div className="text-center md:border-r" style={{ borderColor: theme.textColor + '20' }}>
          <div className="text-5xl font-bold mb-2" style={{ color: theme.primaryColor }}>
            {avgRating}
          </div>
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(parseFloat(avgRating.toString()))
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star, index) => {
            const count = distribution[index];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-8" style={{ color: theme.textColor }}>{star}★</span>
                <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: theme.primaryColor
                    }}
                  />
                </div>
                <span className="text-sm w-8 text-right" style={{ color: theme.textColor, opacity: 0.7 }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-6 rounded-lg border bg-white/50"
            style={{ borderColor: theme.textColor + '20' }}
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80"
                >
                  <User className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: theme.textColor }}>
                      {review.buyerName}
                    </span>
                    {review.verified && (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/50"
                        style={{
                          color: theme.primaryColor
                        }}
                      >
                        <Shield className="w-3 h-3" />
                        Verified Purchase
                      </div>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: theme.textColor, opacity: 0.6 }}>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <p className="mb-4 leading-relaxed" style={{ color: theme.textColor }}>
              {review.comment}
            </p>

            {/* Helpful Button */}
            <button
              onClick={() => handleHelpful(review.id)}
              disabled={helpfulClicked.has(review.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                helpfulClicked.has(review.id) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'
              }`}
              style={{
                backgroundColor: theme.primaryColor + '10',
                color: theme.primaryColor
              }}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful {review.helpful > 0 ? `(${review.helpful})` : ''}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
