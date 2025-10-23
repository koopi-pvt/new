'use client';

import React, { useState, useEffect } from 'react';
import { Star, Send, ShieldCheck, PackageCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import { canBuyerReviewProduct, hasAlreadyReviewed } from '@/lib/reviewVerification';

type ReviewSubmissionProps = {
  productId: string;
  storeId: string;
  buyerId?: string;
  buyerEmail: string;
  buyerName: string;
  theme: {
    primaryColor: string;
    textColor: string;
    backgroundColor?: string;
  };
  onReviewSubmitted?: () => void;
};

export function ReviewSubmission({
  productId,
  storeId,
  buyerId,
  buyerEmail,
  buyerName,
  theme,
  onReviewSubmitted
}: ReviewSubmissionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Verify if buyer can review on component mount
  useEffect(() => {
    const verifyEligibility = async () => {
      if (!buyerId) {
        setCanReview(false);
        setVerificationMessage('Please log in to review products.');
        setVerifying(false);
        return;
      }

      try {
        // Check if already reviewed
        const hasReviewed = await hasAlreadyReviewed(buyerId, productId);
        if (hasReviewed) {
          setAlreadyReviewed(true);
          setCanReview(false);
          setVerificationMessage('You have already reviewed this product.');
          setVerifying(false);
          return;
        }

        // Check if purchased and delivered
        const verification = await canBuyerReviewProduct(buyerId, productId, storeId);
        setCanReview(verification.canReview);
        if (!verification.canReview) {
          setVerificationMessage(verification.reason || 'You cannot review this product.');
        }
      } catch (err) {
        console.error('Error verifying review eligibility:', err);
        setCanReview(false);
        setVerificationMessage('Unable to verify purchase. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEligibility();
  }, [buyerId, productId, storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canReview) {
      setError('You are not eligible to review this product.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Add review to reviews collection
      await addDoc(collection(db, 'reviews'), {
        productId,
        storeId,
        buyerId: buyerId || null,
        buyerEmail,
        buyerName,
        rating,
        comment: comment.trim(),
        helpful: 0,
        verified: true, // Always true since we verified purchase
        verifiedPurchase: true, // Mark as verified purchase
        createdAt: serverTimestamp(),
      });

      // Update product's review count and average rating
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        reviewCount: increment(1),
        // Note: Average rating will be recalculated when fetching reviews
      });

      setSubmitted(true);
      setRating(0);
      setComment('');
      
      setTimeout(() => {
        setSubmitted(false);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }, 2000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show verification loading state
  if (verifying) {
    return (
      <div className="flex items-center justify-center py-8">
        <div 
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.primaryColor }}
        />
        <span className="ml-3" style={{ color: theme.textColor }}>
          Verifying purchase...
        </span>
      </div>
    );
  }

  // Show if already reviewed
  if (alreadyReviewed) {
    return (
      <div 
        className="p-6 rounded-lg text-center border"
        style={{ 
          backgroundColor: theme.primaryColor + '10',
          borderColor: theme.primaryColor + '30',
          color: theme.textColor 
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5" style={{ color: theme.primaryColor }} />
          <h3 className="font-semibold">You've Already Reviewed This Product</h3>
        </div>
        <p className="text-sm opacity-70">Thank you for sharing your feedback!</p>
      </div>
    );
  }

  // Show if cannot review
  if (!canReview) {
    return (
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: '#FEF2F2',
          borderColor: '#FCA5A5',
          color: '#991B1B' 
        }}
      >
        <div className="flex items-start gap-3">
          <PackageCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Purchase Required to Review</h3>
            <p className="text-sm">{verificationMessage}</p>
            <p className="text-sm mt-2 opacity-80">
              Only customers who have purchased and received this product can leave a review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (submitted) {
    return (
      <div 
        className="p-6 rounded-lg text-center"
        style={{ 
          backgroundColor: theme.primaryColor + '10',
          color: theme.textColor 
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <h3 className="font-semibold">Thank you for your review!</h3>
        </div>
        <p className="text-sm opacity-70">Your verified purchase review helps others make informed decisions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Verified Purchase Badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/50 border border-gray-200/50"
      >
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span className="font-medium text-gray-800">Verified Purchase - Your review will be marked as authentic</span>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
          Your Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm ml-2" style={{ color: theme.textColor, opacity: 0.7 }}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none resize-none bg-white/80"
          style={{
            borderColor: theme.textColor + '30',
            color: theme.textColor,
          }}
          disabled={submitting}
          required
          minLength={10}
        />
        <p className="text-xs mt-1" style={{ color: theme.textColor, opacity: 0.6 }}>
          Minimum 10 characters ({comment.length}/10)
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 shadow-md active:scale-95"
        style={{ backgroundColor: theme.primaryColor }}
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}
