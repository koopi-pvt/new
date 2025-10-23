'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 'LKR 0',
    frequency: '/forever',
    description: 'Get started with all the essentials to launch and grow your business.',
    features: [
      'Unlimited Products',
      'Beautiful Storefront',
      'Secure Checkout',
      'Real-time Analytics',
      'Email Support',
    ],
    cta: 'Start for Free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: 'Coming Soon',
    frequency: '',
    description: 'Unlock advanced features to scale your business to the next level.',
    features: [
      'Everything in Free, plus:',
      'Advanced AI Analytics',
      'Multi-currency Support',
      'API Access',
      'Priority Support',
    ],
    cta: 'Get Notified',
    href: '#',
    featured: true,
    comingSoon: true,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 sm:py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Pricing</h2>
          <p className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            The perfect plan, free forever.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg leading-8 text-gray-600">
          We believe in empowering entrepreneurs. That's why our core platform is free, with powerful Pro features on the horizon.
        </p>
        <div className="isolate mx-auto mt-16 sm:mt-20 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
          {plans.map((plan, planIdx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: planIdx * 0.1, duration: 0.5, ease: "easeOut" }}
              className={`relative flex flex-col rounded-3xl p-8 ring-1 shadow-lg ${
                plan.featured
                  ? 'bg-gray-900 ring-gray-900'
                  : 'bg-white ring-gray-200'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                    <Zap className="inline w-4 h-4 mr-1" />
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold leading-8 ${
                    plan.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-4 text-sm leading-6 ${
                    plan.featured ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span
                    className={`text-4xl font-bold tracking-tight ${
                      plan.featured ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm font-semibold leading-6 ${
                      plan.featured ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {plan.frequency}
                  </span>
                </p>
                <Link
                  href={plan.href}
                  aria-describedby={plan.name}
                  className={`mt-6 block rounded-full py-3 px-4 text-center text-sm font-semibold leading-6 transition-all active:scale-95 ${
                    plan.featured
                      ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                      : 'bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus-visible:outline-blue-600'
                  } ${plan.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {plan.cta}
                </Link>
              </div>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${
                  plan.featured ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-6 w-5 flex-none ${
                        plan.featured ? 'text-blue-400' : 'text-blue-500'
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};