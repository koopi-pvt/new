"use client";

import { Lightbulb, Megaphone, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GrowthCenter = () => {
  const router = useRouter();

  const growthItems = [
    {
      title: 'Marketing Tips',
      description: 'Learn how to promote your products and reach more customers.',
      icon: Megaphone,
      action: () => alert('Coming soon!'),
      color: 'blue'
    },
    {
      title: 'Analytics Insights',
      description: 'Understand your sales data to make better decisions.',
      icon: BarChart2,
      action: () => router.push('/dashboard/analytics'),
      color: 'purple'
    },
    {
      title: 'Product Ideas',
      description: 'Get inspiration for your next digital product.',
      icon: Lightbulb,
      action: () => alert('Coming soon!'),
      color: 'yellow'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[24px] p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">The Growth Center</h2>
      <div className="space-y-4">
        {growthItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200/80 hover:bg-white hover:border-gray-300/80 transition-all shadow-sm text-left"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${item.color}-100 flex-shrink-0`}>
                <Icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthCenter;