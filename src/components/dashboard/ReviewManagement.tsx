'use client';

import React from 'react';
import { Star, ThumbsUp, Trash2 } from 'lucide-react';

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: any;
  approved: boolean;
};

type ReviewManagementProps = {
  reviews: Review[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ReviewManagement({ reviews, onApprove, onDelete }: ReviewManagementProps) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border border-gray-200/50">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 text-sm">When customers leave reviews, they will appear here.</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white/80 border border-gray-200/80 rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{review.author}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!review.approved && (
                  <button onClick={() => onApprove(review.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => onDelete(review.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-700 mt-3">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-3">{new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}