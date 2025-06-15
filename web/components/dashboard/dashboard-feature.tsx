'use client';

import { AppHero } from '../ui/ui-layout';
import { 
  Car, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Activity,
  Zap,
  Globe,
  Eye,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

// Optimized animation variants with reduced motion support
const createAnimationVariants = (prefersReducedMotion: boolean) => ({
  fadeInUp: {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.4, ease: [0.4, 0, 0.2, 1] }
    },
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0.05 : 0.1,
        delayChildren: prefersReducedMotion ? 0.1 : 0.2,
      },
    },
  },
  
  scaleOnHover: prefersReducedMotion ? {} : {
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  
  cardHover: prefersReducedMotion ? {} : {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  
  slideInRight: {
    initial: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
    },
  }
});

export default function DashboardFeature() {
  const { connected, publicKey } = useWallet();
  const prefersReducedMotion = useReducedMotion();
  const animations = useMemo(() => createAnimationVariants(!!prefersReducedMotion), [prefersReducedMotion]);

  // Memoized data to prevent unnecessary re-renders
  const quickActions = useMemo(() => [
    {
      title: 'My Account',
      description: 'View and manage your account details',
      icon: Users,
      href: '/account',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-400 to-red-500',
      restricted: 'user',
      stats: { count: 1, label: 'Profile' }
    },
    {
      title: 'My Cars',
      description: 'View and manage your vehicles',
      icon: Car,
      href: '/owned-cars',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-400 to-purple-500',
      restricted: 'user',
      stats: { count: 3, label: 'Vehicles' }
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell vehicles securely',
      icon: TrendingUp,
      href: '/marketplace',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-400 to-orange-500',
      restricted: 'all',
      stats: { count: 45, label: 'Active Listings' }
    },
    {
      title: 'Inspector Dashboard',
      description: 'Manage vehicle inspections',
      icon: FileText,
      href: '/inspector',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-400 to-blue-500',
      restricted: 'inspector',
      stats: { count: 12, label: 'Pending' }
    },
    {
      title: 'Conformity Expert',
      description: 'Review and verify vehicle conformity',
      icon: Shield,
      href: '/confirmity-expert',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-400 to-green-500',
      restricted: 'expert',
      stats: { count: 8, label: 'Reviews' }
    }
  ], []);

  const stats = useMemo(() => [
    { 
      label: 'Total Vehicles', 
      value: '1,234', 
      icon: Car,
      change: '+12%',
      changeType: 'positive',
      description: 'Registered on platform'
    },
    { 
      label: 'Verified Users', 
      value: '856', 
      icon: CheckCircle,
      change: '+8%',
      changeType: 'positive',
      description: 'Government verified'
    },
    { 
      label: 'Pending Reviews', 
      value: '23', 
      icon: Clock,
      change: '-15%',
      changeType: 'negative',
      description: 'Awaiting verification'
    },
    { 
      label: 'Active Sales', 
      value: '45', 
      icon: TrendingUp,
      change: '+23%',
      changeType: 'positive',
      description: 'Currently listed'
    }
  ], []);

  const recentActivities = useMemo(() => [
    { 
      action: 'Vehicle Registered', 
      details: 'Toyota Camry 2023 • VIN: 1HGBH41JXMN109186', 
      time: '2 hours ago', 
      status: 'success',
      avatar: '🚗',
      priority: 'normal'
    },
    { 
      action: 'User Verified', 
      details: 'john.doe@example.com • Government ID Confirmed', 
      time: '4 hours ago', 
      status: 'success',
      avatar: '✅',
      priority: 'normal'
    },
    { 
      action: 'Inspection Required', 
      details: 'Honda Civic 2022 • Safety Check Due', 
      time: '6 hours ago', 
      status: 'warning',
      avatar: '🔍',
      priority: 'high'
    },
    { 
      action: 'Vehicle Sold', 
      details: 'BMW X5 2021 • $45,000 • Transfer Complete', 
      time: '1 day ago', 
      status: 'success',
      avatar: '💰',
      priority: 'normal'
    },
    { 
      action: 'Fraud Alert', 
      details: 'Suspicious activity detected • Investigation started', 
      time: '2 days ago', 
      status: 'error',
      avatar: '⚠️',
      priority: 'critical'
    }
  ], []);

  const platformFeatures = useMemo(() => [
    {
      icon: Car,
      title: 'Vehicle Management',
      description: 'Register, transfer, and manage vehicle ownership with complete transparency and security',
      color: 'purple',
      benefits: ['Blockchain Security', 'Instant Verification', 'Complete History']
    },
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Government-verified users and certified inspector reports ensure trust and authenticity',
      color: 'blue',
      benefits: ['Government ID Check', 'Expert Inspections', 'Fraud Protection']
    },
    {
      icon: TrendingUp,
      title: 'Global Marketplace',
      description: 'Buy and sell vehicles with transparent ownership history and instant settlement',
      color: 'green',
      benefits: ['Global Access', 'Instant Settlement', 'Price Discovery']
    }
  ], []);

  // Helper function to get status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-400/20 text-green-300 border-green-500/30';
      case 'warning': return 'bg-amber-400/20 text-amber-300 border-amber-500/30';
      case 'error': return 'bg-red-400/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-blue-400/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-400/20 text-slate-300 border-slate-500/30';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <AppHero 
        title={
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-3"
          >
            <motion.div
              animate={!prefersReducedMotion ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-2xl"
            >
              <Car size={40} className="text-white" />
            </motion.div>
            CarChain Platform
          </motion.span>
        }
        subtitle="Revolutionizing vehicle ownership through blockchain technology • Secure • Transparent • Global"
      />
      
      {connected ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
                  <p className="text-purple-300 text-sm">
                    Account: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                  </p>
                </div>
              </div>
              <motion.div 
                className="hidden md:flex items-center space-x-4"
                variants={animations.staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={animations.fadeInUp} className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-purple-300">Uptime</div>
                </motion.div>
                <div className="w-px h-8 bg-purple-500/30" />
                <motion.div variants={animations.fadeInUp} className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-purple-300">Support</div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.section
            variants={animations.staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              variants={animations.fadeInUp}
              className="flex items-center mb-6"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Platform Overview</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={animations.fadeInUp}
                  whileHover={animations.cardHover}
                  className="group bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors"
                      whileHover={!prefersReducedMotion ? { rotate: 5, scale: 1.1 } : {}}
                    >
                      <stat.icon className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors">
                      {stat.value}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-slate-500 text-xs">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              </div>
              <motion.button 
                whileHover={animations.scaleOnHover}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                <Eye className="w-4 h-4 inline mr-1" />
                View All
              </motion.button>
            </div>
            
            <motion.div
              variants={animations.staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  variants={animations.fadeInUp}
                  whileHover={animations.cardHover}
                  whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                  className="group"
                >
                  <Link href={action.href} className="block">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div 
                          className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                          whileHover={!prefersReducedMotion ? { rotate: 5, scale: 1.1 } : {}}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{action.stats.count}</div>
                          <div className="text-xs text-slate-400">{action.stats.label}</div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-100 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                        {action.description}
                      </p>
                      
                      <motion.div 
                        className="flex items-center text-purple-400 group-hover:text-purple-300 transition-all duration-300"
                        whileHover={!prefersReducedMotion ? { x: 4 } : {}}
                      >
                        <span className="text-sm font-medium">Get Started</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>
              <motion.button 
                whileHover={animations.scaleOnHover}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                View All Activity
              </motion.button>
            </div>
            
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
              <motion.div 
                variants={animations.staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    variants={animations.fadeInUp}
                    whileHover={animations.slideInRight}
                    className="group flex items-start space-x-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        {activity.avatar}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 ${getPriorityIndicator(activity.priority)} rounded-full ring-2 ring-slate-700`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white group-hover:text-purple-100 transition-colors">
                            {activity.action}
                          </p>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                            {activity.details}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status.toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        </div>
      ) : (
        // Not Connected State
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl p-12 shadow-2xl">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Shield className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Connect your Solana wallet to access the CarChain platform and experience 
                  the future of vehicle ownership management.
                </p>
              </motion.div>
              
              <motion.div
                variants={animations.staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-wrap gap-4 justify-center my-12"
              >
                {[
                  { icon: '🔒', text: 'Bank-Level Security', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                  { icon: '⚡', text: 'Lightning Fast', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  { icon: '🌐', text: 'Fully Decentralized', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                  { icon: '💎', text: 'Zero Fees', color: 'bg-green-500/20 text-green-300 border-green-500/30' }
                ].map((badge, index) => (
                  <motion.div
                    key={badge.text}
                    variants={animations.fadeInUp}
                    whileHover={animations.scaleOnHover}
                    className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${badge.color}`}
                  >
                    <span className="mr-3 text-lg">{badge.icon}</span>
                    {badge.text}
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Features Preview */}
            <motion.div
              variants={animations.staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            >
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={animations.fadeInUp}
                  whileHover={animations.cardHover}
                  className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl hover:border-purple-500/50 transition-all duration-300"
                >
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${
                      feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      'from-green-500 to-green-600'
                    } rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    whileHover={!prefersReducedMotion ? { rotate: 5, scale: 1.1 } : {}}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
