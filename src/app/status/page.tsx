'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle, AlertCircle, Clock, Activity, Zap, Server, Database, Shield, Mail, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

const systemStatus = {
  overall: 'operational', // operational, degraded, down
  services: [
    { name: 'Web Application', status: 'operational', uptime: '99.99%', icon: Wifi },
    { name: 'API Services', status: 'operational', uptime: '99.98%', icon: Server },
    { name: 'Database (Firebase)', status: 'operational', uptime: '99.99%', icon: Database },
    { name: 'File Storage', status: 'operational', uptime: '99.97%', icon: Server },
    { name: 'Authentication', status: 'operational', uptime: '100%', icon: Shield },
    { name: 'Email Notifications', status: 'operational', uptime: '99.95%', icon: Mail },
  ],
};

const incidents = [
  {
    date: 'January 15, 2025',
    title: 'All Systems Operational',
    description: 'All services are running smoothly with no reported issues.',
    status: 'resolved',
    duration: 'N/A',
  },
  {
    date: 'January 10, 2025',
    title: 'Email Notification Delays',
    description: 'Some users experienced delays in receiving order confirmation emails. Issue was resolved within 15 minutes.',
    status: 'resolved',
    duration: '15 minutes',
  },
  {
    date: 'January 5, 2025',
    title: 'Scheduled Maintenance',
    description: 'Routine database optimization and system updates. Zero downtime achieved.',
    status: 'resolved',
    duration: '0 minutes',
  },
];

const upcomingMaintenance = [
  {
    date: 'January 25, 2025',
    time: '02:00 AM - 03:00 AM UTC',
    title: 'Planned Infrastructure Upgrade',
    description: 'We will be upgrading our servers for improved performance. Expected downtime: less than 5 minutes.',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return {
        icon: CheckCircle,
        text: 'Operational',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600',
        iconColor: 'text-green-500',
      };
    case 'degraded':
      return {
        icon: AlertCircle,
        text: 'Degraded',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-600',
        iconColor: 'text-yellow-500',
      };
    case 'down':
      return {
        icon: AlertCircle,
        text: 'Down',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-600',
        iconColor: 'text-red-500',
      };
    default:
      return {
        icon: Clock,
        text: 'Unknown',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        iconColor: 'text-gray-500',
      };
  }
};

export default function Status() {
  const overallStatus = getStatusBadge(systemStatus.overall);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Unique Hero - System Monitoring Inspired */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Server Rack Visual */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-20 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-48 h-8 border-2 border-green-500 rounded-[4px]"></div>
            ))}
          </div>
          <div className="absolute bottom-20 right-20 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-48 h-8 border-2 border-blue-500 rounded-[4px]"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Activity Monitor */}
            <motion.div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-24 h-24">
                {/* Heartbeat lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <motion.path
                    d="M 0,50 L 20,50 L 25,30 L 30,70 L 35,40 L 40,50 L 100,50"
                    stroke="#10B981"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Platform <span className="text-green-500">Status</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Real-time status and uptime monitoring for all Koopi services
            </p>

            {/* Live Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { label: "Uptime", value: "99.9%", icon: Zap, color: "green" },
                { label: "Response Time", value: "45ms", icon: Activity, color: "blue" },
                { label: "Last Check", value: "Just now", icon: Clock, color: "purple" },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl px-6 py-4 flex items-center gap-3"
                  >
                    <Icon className={`w-5 h-5 text-${metric.color}-500`} />
                    <div className="text-left">
                      <div className="text-xs text-gray-600">{metric.label}</div>
                      <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Service Status</h2>
          <div className="backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl overflow-hidden">
            {systemStatus.services.map((service, index) => {
              const badge = getStatusBadge(service.status);
              const ServiceIcon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 border-b border-gray-200/50 last:border-0 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <ServiceIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <badge.icon className={`w-6 h-6 ${badge.iconColor}`} />
                    <span className={`px-4 py-2 ${badge.bgColor} ${badge.textColor} rounded-full text-sm font-semibold`}>
                      {badge.text}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Maintenance */}
      {upcomingMaintenance.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Maintenance</h2>
            <div className="space-y-4">
              {upcomingMaintenance.map((maintenance, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-blue-50 border-2 border-blue-500/20 rounded-[20px] p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-blue-600">{maintenance.date}</span>
                        <span className="text-sm text-blue-600/70">{maintenance.time}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{maintenance.title}</h3>
                      <p className="text-gray-700">{maintenance.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Incident History */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/50 shadow-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${incident.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">{incident.date}</span>
                      <span className={`px-3 py-1 ${incident.status === 'resolved' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'} rounded-full text-xs font-medium capitalize`}>
                        {incident.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{incident.title}</h3>
                    <p className="text-gray-600 mb-2">{incident.description}</p>
                    <p className="text-sm text-gray-500">Duration: {incident.duration}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
