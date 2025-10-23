"use client";

import withAuth from '@/components/withAuth';
import { ArrowRight, Zap, BarChart2, ShieldCheck, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui';

const proFeatures = [
  {
    icon: <BarChart2 className="w-5 h-5 text-blue-500" />,
    text: "Advanced analytics and reporting",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
    text: "Priority customer support",
  },
  {
    icon: <Users className="w-5 h-5 text-blue-500" />,
    text: "Team collaboration (up to 5 members)",
  },
  {
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    text: "Access to all Pro templates",
  },
  {
    icon: <Check className="w-5 h-5 text-blue-500" />,
    text: "Full website customization",
  },
];

const SubscriptionPage = () => {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [offerData, setOfferData] = useState({ claimedSpots: 0, totalSpots: 100 });

  const isFreeUser = userProfile?.subscription?.plan === 'free';
  const hasClaimed = userProfile?.hasClaimedProOffer || false;

  useEffect(() => {
    const fetchOfferData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const offerDocRef = doc(db, 'promotions', 'proOffer');
        const offerDoc = await getDoc(offerDocRef);
        if (offerDoc.exists()) {
          const data = offerDoc.data();
          setOfferData({
            claimedSpots: data.claimedSpots || 0,
            totalSpots: data.totalSpots || 100,
          });
        }
      } catch (error) {
        console.error("Error fetching offer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferData();
  }, [user]);

  const handleClaimOffer = async () => {
    if (!user) return;
    setIsClaiming(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const offerDocRef = doc(db, 'promotions', 'proOffer');

      await runTransaction(db, async (transaction) => {
        const offerDoc = await transaction.get(offerDocRef);
        if (!offerDoc.exists()) {
          throw "Offer document does not exist!";
        }

        const currentSpots = offerDoc.data().claimedSpots;
        const totalSpots = offerDoc.data().totalSpots;

        if (currentSpots >= totalSpots) {
          throw "Sorry, all spots have been claimed.";
        }

        transaction.update(userDocRef, {
          'subscription.plan': 'pro',
          'subscription.status': 'active',
          hasClaimedProOffer: true,
        });

        transaction.update(offerDocRef, {
          claimedSpots: currentSpots + 1,
        });
      });

    } catch (error) {
      console.error("Error claiming offer: ", error);
      // You might want to show a toast notification here
    } finally {
      setIsClaiming(false);
    }
  };

  const spotsRemaining = offerData.totalSpots - offerData.claimedSpots;
  const offerAvailable = isFreeUser && !hasClaimed && spotsRemaining > 0;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden md:grid md:grid-cols-2 md:gap-4">
          {/* Left Column - Content */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              LIMITED TIME OFFER
            </h2>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Get Pro, For Free.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Be one of the <span className="font-semibold text-gray-800">first {offerData.totalSpots} users</span> to upgrade and receive lifetime access to our Pro plan, absolutely free. No credit card required.
            </p>

            <div className="mt-10">
              {hasClaimed ? (
                <p className="text-lg font-semibold text-green-600">You're on the Pro plan!</p>
              ) : spotsRemaining <= 0 ? (
                <p className="text-lg font-semibold text-red-600">All free spots have been claimed.</p>
              ) : isFreeUser ? (
                <>
                  <button
                    onClick={handleClaimOffer}
                    disabled={isClaiming}
                    className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-8 bg-blue-500 text-white text-base font-semibold rounded-full hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Your Free Pro Plan'}
                    {!isClaiming && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                  {spotsRemaining > 0 && (
                    <p className="mt-4 text-sm text-gray-500">
                      Only {spotsRemaining} spots remaining!
                    </p>
                  )}
                </>
              ) : (
                 <p className="text-lg font-semibold text-blue-600">You're already a Pro user. Thank you!</p>
              )}
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="p-8 md:p-12 lg:p-16 bg-gray-100/70">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">What's Included in Pro?</h3>
            <div className="space-y-5">
              {proFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <p className="text-base text-gray-700 pt-1">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default withAuth(SubscriptionPage);