'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Users, MessageSquare, Heart, Trophy, TrendingUp, Sparkles, UserPlus, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Active Sellers', value: '2,500+', icon: Users, color: 'blue' },
  { label: 'Monthly Posts', value: '5,000+', icon: MessageSquare, color: 'purple' },
  { label: 'Success Stories', value: '500+', icon: Trophy, color: 'amber' },
  { label: 'Community Events', value: '50+', icon: Sparkles, color: 'pink' },
];

const forumCategories = [
  {
    title: 'General Discussion',
    description: 'Connect with other sellers and share experiences',
    posts: 1240,
    icon: MessageSquare,
    color: 'blue',
  },
  {
    title: 'Getting Started',
    description: 'New to Koopi? Get help from experienced sellers',
    posts: 856,
    icon: Sparkles,
    color: 'green',
  },
  {
    title: 'Marketing Tips',
    description: 'Share strategies for growing your business',
    posts: 632,
    icon: TrendingUp,
    color: 'purple',
  },
  {
    title: 'Success Stories',
    description: 'Celebrate wins and inspire others',
    posts: 445,
    icon: Trophy,
    color: 'amber',
  },
  {
    title: 'Feature Requests',
    description: 'Suggest improvements and vote on ideas',
    posts: 298,
    icon: Heart,
    color: 'pink',
  },
  {
    title: 'Technical Help',
    description: 'Get assistance with technical issues',
    posts: 721,
    icon: Users,
    color: 'red',
  },
];

const featuredPosts = [
  {
    author: 'Sarah Chen',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    title: 'How I made my first LKR 100,000 in 30 days',
    excerpt: 'Sharing my journey from zero to success with Koopi. Here are the 5 strategies that worked for me...',
    category: 'Success Stories',
    likes: 124,
    replies: 38,
    time: '2 hours ago',
  },
  {
    author: 'Michael Santos',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    title: 'Best practices for product photography on a budget',
    excerpt: 'You don\'t need expensive equipment to take stunning product photos. I\'ll show you my setup...',
    category: 'Marketing Tips',
    likes: 89,
    replies: 24,
    time: '5 hours ago',
  },
  {
    author: 'Priya Patel',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    title: 'Using discount codes to boost sales during holidays',
    excerpt: 'My proven strategy for creating irresistible promotions that convert...',
    category: 'Marketing Tips',
    likes: 156,
    replies: 42,
    time: '1 day ago',
  },
];

const getColorClasses = (color: string) => {
  const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', icon: 'text-purple-500' },
    green: { bg: 'bg-green-500', text: 'text-green-600', icon: 'text-green-500' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', icon: 'text-amber-500' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-600', icon: 'text-pink-500' },
    red: { bg: 'bg-red-500', text: 'text-red-600', icon: 'text-red-500' },
  };
  return colors[color] || colors.blue;
};

export default function Community() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Unique Hero - Connection/Network Inspired */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Network Connection Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Connection nodes */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-purple-500 rounded-full"></div>
          <div className="absolute top-40 left-40 w-4 h-4 bg-blue-500 rounded-full"></div>
          <div className="absolute top-32 right-32 w-4 h-4 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-40 left-1/3 w-4 h-4 bg-amber-500 rounded-full"></div>
          <div className="absolute bottom-32 right-1/4 w-4 h-4 bg-pink-500 rounded-full"></div>
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="20" x2="40" y2="40" stroke="#A855F7" strokeWidth="2" />
            <line x1="40" y1="40" x2="70%" y2="32" stroke="#3B82F6" strokeWidth="2" />
            <line x1="33%" y1="60%" x2="75%" y2="68%" stroke="#10B981" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Network Icon */}
            <motion.div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-24 h-24">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute inset-0 rounded-full border-2 border-purple-500"
                    style={{ transform: `scale(${1 + i * 0.15})` }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-2xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Connect, Learn, and <span className="text-purple-500">Grow Together</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of entrepreneurs sharing tips, celebrating wins, and supporting each other on their e-commerce journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600 transition-all shadow-lg active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                Join the Community
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 backdrop-blur-xl bg-white/70 text-gray-700 rounded-full font-semibold hover:bg-white transition-all shadow-lg active:scale-95"
              >
                Browse Forums
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const colors = getColorClasses(stat.color);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl p-6 text-center"
                >
                  <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Forum Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Forum Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forumCategories.map((category, index) => {
              const colors = getColorClasses(category.color);
              return (
                <motion.a
                  key={index}
                  href="#"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-500 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="text-xs text-gray-500">{category.posts} posts</div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trending Discussions</h2>
          <div className="space-y-4">
            {featuredPosts.map((post, index) => (
              <motion.a
                key={index}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group block backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-500 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">{post.author}</span>
                          <span>•</span>
                          <span>{post.time}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
