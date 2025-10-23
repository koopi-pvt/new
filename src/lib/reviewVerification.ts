import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Checks if a buyer has purchased and received a specific product
 * Returns true only if the buyer has at least one delivered order containing the product
 */
export async function canBuyerReviewProduct(
  buyerId: string,
  productId: string,
  storeId: string
): Promise<{ canReview: boolean; reason?: string }> {
  try {
    // Query orders for this buyer from this store
    const ordersQuery = query(
      collection(db, 'orders'),
      where('buyerId', '==', buyerId),
      where('storeId', '==', storeId),
      where('status', '==', 'Delivered') // Only delivered orders
    );

    const ordersSnapshot = await getDocs(ordersQuery);

    // Check if any delivered order contains this product
    const hasPurchased = ordersSnapshot.docs.some(doc => {
      const orderData = doc.data();
      const items = orderData.items || [];
      return items.some((item: any) => item.productId === productId);
    });

    if (!hasPurchased) {
      return {
        canReview: false,
        reason: 'You can only review products you have purchased and received.'
      };
    }

    return { canReview: true };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return {
      canReview: false,
      reason: 'Unable to verify purchase. Please try again.'
    };
  }
}

/**
 * Checks if a buyer has already reviewed a product
 */
export async function hasAlreadyReviewed(
  buyerId: string,
  productId: string
): Promise<boolean> {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('buyerId', '==', buyerId),
      where('productId', '==', productId)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    return !reviewsSnapshot.empty;
  } catch (error) {
    console.error('Error checking existing review:', error);
    return false;
  }
}
