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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

export default function DashboardFeature() {
  const { connected, publicKey } = useWallet();

  const quickActions = [
    {
      title: 'My Account',
      description: 'View and manage your account',
      icon: Users,
      href: '/account',
      color: 'bg-red-500',
      restricted: 'user'
    },
    {
      title: 'My Cars',
      description: 'View and manage your vehicles',
      icon: Car,
      href: '/owned-cars',
      color: 'bg-purple-500',
      restricted: 'user'
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell vehicles',
      icon: TrendingUp,
      href: '/marketplace',
      color: 'bg-orange-500',
      restricted: 'all'
    },
    {
      title: 'Inspector Dashboard',
      description: 'Manage vehicle inspections',
      icon: FileText,
      href: '/inspector',
      color: 'bg-blue-500',
      restricted: 'inspector'
    },
    {
      title: 'Confirmity Expert Dashboard',
      description: 'Review and verify vehicle conformity',
      icon: Shield,
      href: '/confirmity-expert',
      color: 'bg-green-500', 
      restricted: 'expert'
    }
  ];

  const stats = [
    { label: 'Total Vehicles', value: '1,234', icon: Car },
    { label: 'Verified Users', value: '856', icon: CheckCircle },
    { label: 'Pending Verifications', value: '23', icon: Clock },
    { label: 'Active Sales', value: '45', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <AppHero 
        title="CarChain Platform" 
        subtitle="Secure vehicle ownership management on Solana blockchain" 
      />
      
      {connected ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
                      <p className="text-base-content/70">{stat.label}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={action.href}>
                      <div className="card bg-gradient-to-r from-base-200 to-base-300 hover:from-primary/10 hover:to-primary/5 transition-all duration-300 cursor-pointer group">
                        <div className="card-body">
                          <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg">{action.title}</h3>
                          <p className="text-base-content/70 text-sm">{action.description}</p>
                          <div className="flex items-center mt-2 text-primary group-hover:translate-x-2 transition-transform duration-300">
                            <span className="text-sm">Get Started</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {[
                  { action: 'Vehicle registered', details: 'Toyota Camry 2023', time: '2 hours ago', status: 'success' },
                  { action: 'User verified', details: 'john.doe@example.com', time: '4 hours ago', status: 'success' },
                  { action: 'Inspection report', details: 'VIN: 1HGBH41JXMN109186', time: '6 hours ago', status: 'pending' },
                  { action: 'Vehicle sold', details: 'Honda Civic 2022', time: '1 day ago', status: 'success' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        activity.status === 'success' ? 'bg-success' : 'bg-warning'
                      }`} />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-base-content/70">{activity.details}</p>
                      </div>
                    </div>
                    <span className="text-sm text-base-content/50">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-2xl"
            >
              <div className="card-body text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-primary mb-6" />
                <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-xl text-base-content/70 mb-8">
                  Connect your Solana wallet to access the CarChain platform and manage vehicle ownership securely.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="badge badge-lg badge-primary">🔒 Secure</div>
                  <div className="badge badge-lg badge-secondary">⚡ Fast</div>
                  <div className="badge badge-lg badge-accent">🌐 Decentralized</div>
                </div>
              </div>
            </motion.div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: Car,
                  title: 'Vehicle Management',
                  description: 'Register, transfer, and manage vehicle ownership on-chain'
                },
                {
                  icon: Shield,
                  title: 'Secure Verification',
                  description: 'Government-verified users and verified inspector reports'
                },
                {
                  icon: TrendingUp,
                  title: 'Marketplace',
                  description: 'Buy and sell vehicles with transparent ownership history?'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="card bg-base-100 shadow-lg"
                >
                  <div className="card-body text-center">
                    <feature.icon className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-base-content/70">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
