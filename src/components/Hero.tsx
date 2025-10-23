'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Store, Zap, Shield, Star, Users, TrendingUp, Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function Hero() {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentMetric, setCurrentMetric] = useState(0);

  const metrics = [
    { value: "2,500+", label: "Active Stores", icon: Store, color: "blue" },
    { value: "99.9%", label: "Uptime", icon: Zap, color: "green" },
    { value: "$2M+", label: "Sales Volume", icon: TrendingUp, color: "purple" },
    { value: "50K+", label: "Products", icon: Package, color: "amber" },
  ];

  const terminalCommands = [
    "$ koopi init my-store",
    "✓ Creating your store...",
    "✓ Setting up products catalog...",
    "✓ Configuring payment system...",
    "✓ Launching storefront...",
    "✓ Store is LIVE at my-store.koopi.lk",
  ];

  // Terminal animation effect
  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < terminalCommands.length) {
        setTerminalLines((prev) => [...prev.filter(Boolean), terminalCommands[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTerminalLines([]);
          lineIndex = 0;
        }, 2000);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Metric animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#f5f5f7]">
      {/* Background Geometry */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-500 rounded-[20px] rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-purple-500 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border-2 border-amber-500 rounded-[20px] -rotate-6"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 border-2 border-green-500 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 border-2 border-blue-500 rounded-[20px] rotate-45"></div>

        {/* Dotted Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiMzQjgyRjYiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >

            {/* Heading */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
                <span className="block text-gray-900">Build Your Store</span>
                <span className="block text-blue-500">Command by Command</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Simple as running a script. Powerful as a full platform. Zero coding required.
              </p>
            </div>

            {/* Terminal Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-xl bg-gray-900 rounded-[20px] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">terminal — bash</span>
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm space-y-2 h-48 overflow-hidden">
                {terminalLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${
                      line?.startsWith('✓')
                        ? 'text-green-400'
                        : line?.startsWith('$')
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {line ?? ""}
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-blue-400 ml-1"
                ></motion.span>
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-500 rounded-full shadow-xl hover:bg-blue-600 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Start Building Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 backdrop-blur-xl bg-white/70 rounded-full border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Store Mockup */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Your Store</div>
                    <div className="text-xs text-gray-600">yourstore.koopi.lk</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">Live</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                  <span className="text-sm font-medium text-gray-700">Total Orders</span>
                  <span className="text-lg font-bold text-blue-600">127</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                  <span className="text-sm font-medium text-gray-700">Revenue</span>
                  <span className="text-lg font-bold text-purple-600">$12,450</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                  <span className="text-sm font-medium text-gray-700">Products</span>
                  <span className="text-lg font-bold text-green-600">45</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200/50">
                {["Orders", "Products", "Analytics"].map((action, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">{action}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating Metric Cards */}
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const positions = [
                { top: "0%", left: "-10%" },
                { top: "10%", right: "-10%" },
                { bottom: "30%", left: "-15%" },
                { bottom: "10%", right: "-10%" },
              ];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: currentMetric === index ? 1 : 0.6,
                    scale: currentMetric === index ? 1 : 0.9,
                    y: [0, -5, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
                  }}
                  className="absolute hidden lg:block backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl p-4"
                  style={positions[index]}
                >
                  <div className={`w-10 h-10 rounded-full bg-${metric.color}-500/10 flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-500`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">{metric.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">2,500+ Stores</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span className="text-sm font-semibold text-gray-700">5.0 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-semibold text-gray-700">5-Min Setup</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
