// src/components/government/government-dashboard.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import {
  Users,
  Car,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  UserCheck,
  BarChart3,
  Activity,
  Crown,
  AlertTriangle,
  Search,
  Zap,
  PieChart,
  LineChart,
  ClipboardCheck,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import {
  useGetPendingUsers,
  useVerifyUser,
  useGetAllUsers,
  useGetPlatformStatistics,
  useRejectUser,
  useGetGovernmentProfile,
  useRegisterCar,
  useGetAllCars,
  useGetCarStatistics,
} from './government-data-access';
import { ExplorerLink } from '../cluster/cluster-ui';
import { ellipsify } from '../ui/ui-layout';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { GOVERNMENT_AUTHORITY } from '../inspector/inspector-data-access';

export function GovernmentDashboard() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCarRegistrationModal, setShowCarRegistrationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Data hooks
  const governmentProfileQuery = useGetGovernmentProfile(publicKey?.toString());
  const pendingUsersQuery = useGetPendingUsers();
  const allUsersQuery = useGetAllUsers();
  const platformStatsQuery = useGetPlatformStatistics();
  const allCarsQuery = useGetAllCars();
  const carStatsQuery = useGetCarStatistics();

  // Mutations
  const verifyUserMutation = useVerifyUser();
  const rejectUserMutation = useRejectUser();
  const registerCarMutation = useRegisterCar();

  // Check if user is government
  // const isGovernment = governmentProfileQuery.data?.role?.government !== undefined;
  const isGovernment = publicKey?.toString() === GOVERNMENT_AUTHORITY.toString();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'cars', label: 'Car Registration', icon: Car },
    { id: 'statistics', label: 'Analytics', icon: TrendingUp },
  ];

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl max-w-md w-full text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-6"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Government Access Required
          </h2>
          <p className="text-purple-200/80 leading-relaxed">
            Please connect your government wallet to access the dashboard
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isGovernment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/50 to-purple-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 shadow-2xl max-w-md w-full text-center"
        >
          <motion.div
            animate={{ 
              shake: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-flex p-4 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl mb-6"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Access Denied
          </h2>
          <p className="text-purple-200/80 leading-relaxed">
            This dashboard is restricted to government officials only.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-2xl shadow-lg"
              >
                <Crown className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Government Dashboard
                </h1>
                <p className="text-sm text-purple-200/70">Platform Administration</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="text-right">
                <p className="text-sm text-white font-semibold">
                  {governmentProfileQuery.data?.userName || 'Government Official'}
                </p>
                <p className="text-xs text-purple-200/60">
                  {ellipsify(publicKey.toString())}
                </p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Crown className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-purple-500/30 shadow-xl"
        >
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg transform scale-105'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardOverview
                platformStats={platformStatsQuery.data}
                carStats={carStatsQuery.data}
                pendingUsersCount={pendingUsersQuery.data?.length || 0}
                isLoading={platformStatsQuery.isLoading || carStatsQuery.isLoading}
              />
            )}

            {activeTab === 'users' && (
              <UserManagement
                pendingUsers={pendingUsersQuery.data || []}
                allUsers={allUsersQuery.data || []}
                onVerifyUser={({
                  userPublicKey,
                  username,
                }: {
                  userPublicKey: string;
                  username: string;
                }) => {
                  verifyUserMutation.mutate(
                    { userPublicKey, username },
                    {
                      onSuccess: () => {
                        toast.success('User verified successfully!');
                        pendingUsersQuery.refetch();
                        allUsersQuery.refetch();
                      },
                      onError: (error) => {
                        toast.error('Failed to verify user');
                        console.error('Verification error:', error);
                      },
                    }
                  );
                }}
                onRejectUser={(userId: string, reason: string) => {
                  rejectUserMutation.mutate(
                    { userId, reason },
                    {
                      onSuccess: () => {
                        toast.success('User rejected');
                        pendingUsersQuery.refetch();
                      },
                      onError: (error) => {
                        toast.error('Failed to reject user');
                        console.error('Rejection error:', error);
                      },
                    }
                  );
                }}
                isLoading={pendingUsersQuery.isLoading || allUsersQuery.isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
              />
            )}

            {activeTab === 'cars' && (
              <CarRegistration
                allCars={allCarsQuery.data || []}
                onRegisterCar={(carData) => {
                  registerCarMutation.mutate(carData, {
                    onSuccess: () => {
                      toast.success('Car registered successfully!');
                      allCarsQuery.refetch();
                      setShowCarRegistrationModal(false);
                    },
                    onError: (error) => {
                      toast.error('Failed to register car');
                      console.error('Car registration error:', error);
                    },
                  });
                }}
                isLoading={allCarsQuery.isLoading}
                showModal={showCarRegistrationModal}
                setShowModal={setShowCarRegistrationModal}
              />
            )}

            {activeTab === 'statistics' && (
              <AnalyticsDashboard
                platformStats={platformStatsQuery.data}
                carStats={carStatsQuery.data}
                isLoading={platformStatsQuery.isLoading || carStatsQuery.isLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


// Dashboard Overview Component

function DashboardOverview({
  platformStats,
  carStats,
  pendingUsersCount,
  isLoading,
}: any) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 animate-pulse shadow-xl"
          >
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl mb-4"></div>
            <div className="h-4 bg-purple-500/20 rounded-lg mb-2"></div>
            <div className="h-6 bg-purple-500/20 rounded-lg"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: platformStats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      change: '+12%',
    },
    {
      title: 'Pending Verifications',
      value: pendingUsersCount,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      change: '+3',
      urgent: pendingUsersCount > 0,
    },
    {
      title: 'Registered Cars',
      value: carStats?.totalCars || 0,
      icon: Car,
      color: 'from-emerald-500 to-green-500',
      change: '+8%',
    },
    {
      title: 'Cars for Sale',
      value: carStats?.carsForSale || 0,
      icon: Tag,
      color: 'from-violet-500 to-purple-500',
      change: '+15%',
    },
    {
      title: 'Verified Users',
      value: platformStats?.verifiedUsers || 0,
      icon: CheckCircle,
      color: 'from-teal-500 to-emerald-500',
      change: '+5%',
    },
    {
      title: 'Active Inspectors',
      value: platformStats?.activeInspectors || 0,
      icon: Shield,
      color: 'from-indigo-500 to-purple-600',
      change: '+2',
    },
    {
      title: 'Total Inspections',
      value: carStats?.totalInspections || 0,
      icon: ClipboardCheck,
      color: 'from-cyan-500 to-blue-500',
      change: '+25%',
    },
    {
      title: 'Platform Revenue',
      value: `$${(platformStats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      change: '+18%',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{
              y: -4,
              transition: { duration: 0.2 },
            }}
            className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group shadow-xl hover:shadow-2xl ${
              stat.urgent
                ? 'ring-2 ring-amber-400/50 animate-pulse shadow-amber-400/20'
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              {stat.change && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-xs text-emerald-400 font-medium bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full"
                >
                  {stat.change}
                </motion.span>
              )}
            </div>
            <h3 className="text-purple-200/80 text-sm font-medium mb-2">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all border border-purple-400/30 hover:border-purple-400/50 shadow-lg hover:shadow-xl"
          >
            <UserCheck className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Verify Pending Users</span>
            {pendingUsersCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg"
              >
                {pendingUsersCount}
              </motion.span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all border border-emerald-400/30 hover:border-emerald-400/50 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">Register New Car</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 bg-violet-500/20 hover:bg-violet-500/30 rounded-xl transition-all border border-violet-400/30 hover:border-violet-400/50 shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <span className="text-white font-medium">View Analytics</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              type: 'user_verified',
              user: 'Ahmed Mohammed',
              time: '2 minutes ago',
              icon: CheckCircle,
              color: 'text-emerald-400',
            },
            {
              type: 'car_registered',
              car: 'Toyota Camry 2023',
              time: '5 minutes ago',
              icon: Car,
              color: 'text-purple-400',
            },
            {
              type: 'inspection_completed',
              inspector: 'Sarah Wilson',
              time: '10 minutes ago',
              icon: Shield,
              color: 'text-blue-400',
            },
            {
              type: 'user_pending',
              user: 'Mohammed Ali',
              time: '15 minutes ago',
              icon: Clock,
              color: 'text-amber-400',
            },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 bg-white/5 hover:bg-purple-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-500/20"
            >
              <div
                className={`p-2 ${activity.color
                  .replace('text-', 'bg-')
                  .replace('-400', '-500/20')} rounded-xl`}
              >
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {activity.type === 'user_verified' &&
                    `User ${activity.user} has been verified`}
                  {activity.type === 'car_registered' &&
                    `New car ${activity.car} registered`}
                  {activity.type === 'inspection_completed' &&
                    `Inspection completed by ${activity.inspector}`}
                  {activity.type === 'user_pending' &&
                    `New user ${activity.user} pending verification`}
                </p>
                <p className="text-purple-200/60 text-xs mt-1">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserManagement({
  pendingUsers,
  allUsers,
  onVerifyUser,
  onRejectUser,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
}: any) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch =
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.publicKey.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'pending' && !user.isVerified);

    return matchesSearch && matchesFilter;
  });
  console.log(allUsers);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-purple-500/20 rounded-xl w-1/4"></div>
            <div className="h-12 bg-purple-500/20 rounded-xl"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-16 bg-purple-500/20 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Pending Users Alert */}
      <AnimatePresence>
        {pendingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-400/40 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="bg-amber-400 p-3 rounded-xl shadow-lg"
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  Pending User Verifications
                </h3>
                <p className="text-amber-100/80">
                  {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''}{' '}
                  waiting for verification
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus('pending')}
                className="bg-amber-400 hover:bg-amber-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Review Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              placeholder="Search users by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-purple-500/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-w-[150px]"
          >
            <option value="all" className="bg-slate-800">
              All Users
            </option>
            <option value="verified" className="bg-slate-800">
              Verified
            </option>
            <option value="pending" className="bg-slate-800">
              Pending
            </option>
          </motion.select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            User Management
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-500/10">
              <tr>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  User
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Role
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Registration Date
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any, index: number) => (
                <motion.tr
                  key={user.publicKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                  className="border-t border-purple-500/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <Users className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-white font-medium">
                          {user.userName}
                        </p>
                        <p className="text-purple-200/60 text-sm font-mono">
                          {ellipsify(user.publicKey)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        user.isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                      }`}
                    >
                      {user.isVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </motion.span>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-200/80 font-medium">
                      {user.role?.confirmityExpert
                        ? 'Confirmity Expert'
                        : user.role?.inspector
                        ? 'Inspector'
                        : 'Regular User'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-200/70">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="text-purple-400 hover:text-purple-300 p-2 hover:bg-purple-400/20 rounded-xl transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {!user.isVerified && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onVerifyUser({
                                userPublicKey: user.authority,
                                username: user.userName,
                              })
                            }
                            className="text-emerald-400 hover:text-emerald-300 p-2 hover:bg-emerald-400/20 rounded-xl transition-all duration-200"
                            title="Verify User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onRejectUser(user.publicKey, 'Manual rejection')
                            }
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/20 rounded-xl transition-all duration-200"
                            title="Reject User"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetails && selectedUser && (
          <dialog className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="modal-box bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 max-w-3xl shadow-2xl"
            >
              <form method="dialog">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-sm btn-circle absolute right-4 top-4 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-white"
                  onClick={() => setShowUserDetails(false)}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </form>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-2xl text-white mb-6 flex items-center gap-3"
              >
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                User Details
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <label className="text-purple-200/70 text-sm font-medium">
                      Username
                    </label>
                    <p className="text-white font-bold text-lg mt-1">
                      {selectedUser.userName}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <label className="text-purple-200/70 text-sm font-medium">
                      Status
                    </label>
                    <p
                      className={`font-bold text-lg mt-1 ${
                        selectedUser.isVerified
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {selectedUser.isVerified
                        ? 'Verified'
                        : 'Pending Verification'}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <label className="text-purple-200/70 text-sm font-medium">
                      Role
                    </label>
                    <p className="text-white font-bold text-lg mt-1">
                      {selectedUser.role?.government
                        ? 'Government Official'
                        : selectedUser.role?.inspector
                        ? 'Inspector'
                        : 'Regular User'}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <label className="text-purple-200/70 text-sm font-medium">
                      Registration Date
                    </label>
                    <p className="text-white font-bold text-lg mt-1">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <label className="text-purple-200/70 text-sm font-medium mb-2 block">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                    <p className="text-white font-mono text-sm flex-1 break-all">
                      {selectedUser.publicKey}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        navigator.clipboard.writeText(selectedUser.publicKey)
                      }
                      className="text-purple-400 hover:text-purple-300 p-1 hover:bg-purple-400/20 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="mt-3">
                    <ExplorerLink
                      path={`account/${selectedUser.publicKey}`}
                      label="View on Explorer"
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Car Registration Component

function CarRegistration({
  allCars,
  onRegisterCar,
  isLoading,
  showModal,
  setShowModal,
}: any) {
  const [carForm, setCarForm] = useState({
    carId: '',
    vin: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    engineNumber: '',
    ownerUsername: '',
    mileage: 0,
    lastInspectionDate: null,
    latestInspectionReport: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterCar(carForm);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-pulse shadow-xl">
          <div className="h-8 bg-purple-500/20 rounded-xl w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-12 bg-purple-500/20 rounded-xl"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Registration Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Car className="w-6 h-6 text-purple-400" />
              </div>
              Car Registration Center
            </h3>
            <p className="text-purple-200/70 mt-2">
              Register new vehicles and manage existing ones
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Register New Car
          </motion.button>
        </div>
      </motion.div>

      {/* Cars List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-purple-500/20">
          <h4 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Car className="w-5 h-5 text-emerald-400" />
            </div>
            Registered Vehicles
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-500/10">
              <tr>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Vehicle
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">VIN</th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Owner
                </th>
                <th className="text-left p-4 text-purple-200/80 font-medium">
                  Inspection Status
                </th>
              </tr>
            </thead>
            <tbody>
              {allCars?.map((car: any, index: number) => (
                <motion.tr
                  key={car?.publicKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.05)" }}
                  className="border-t border-purple-500/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <Car className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-white font-bold">
                          {car?.brand} {car?.model}
                        </p>
                        <p className="text-purple-200/60 text-sm">
                          {car?.year} • {car?.color}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-white/90 text-sm bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg font-mono">
                      {car?.vin}
                    </code>
                  </td>
                  <td className="p-4">
                    <p className="text-purple-200/80 font-medium">
                      {ellipsify(car.owner.toString())}
                    </p>
                  </td>
                  <td className="p-4">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        car?.inspectionStatus === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                          : car?.inspectionStatus === 'failed'
                          ? 'bg-red-500/20 text-red-400 border-red-400/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                      }`}
                    >
                      {car?.inspectionStatus === 'passed' && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {car?.inspectionStatus === 'failed' && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {car?.inspectionStatus === 'pending' && (
                        <Clock className="w-3 h-3" />
                      )}
                      {typeof car?.inspectionStatus === 'string'
                        ? car.inspectionStatus
                        : 'Pending'}
                    </motion.span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Car Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <dialog className="modal modal-open">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="modal-box bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 max-w-5xl shadow-2xl"
            >
              <form method="dialog">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-sm btn-circle absolute right-4 top-4 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-white"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </form>

              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-2xl text-white mb-8 flex items-center gap-3"
              >
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                Register New Vehicle
              </motion.h3>

              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Car ID */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Car ID
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.carId}
                      onChange={(e) =>
                        setCarForm({ ...carForm, carId: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., CAR001"
                      required
                    />
                  </div>

                  {/* VIN Number */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      VIN Number
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.vin}
                      onChange={(e) =>
                        setCarForm({ ...carForm, vin: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="17-character VIN"
                      required
                      maxLength={17}
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Brand
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.brand}
                      onChange={(e) =>
                        setCarForm({ ...carForm, brand: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Model
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.model}
                      onChange={(e) =>
                        setCarForm({ ...carForm, model: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Year
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      value={carForm.year}
                      onChange={(e) =>
                        setCarForm({ ...carForm, year: parseInt(e.target.value) })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Color
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.color}
                      onChange={(e) =>
                        setCarForm({ ...carForm, color: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., White"
                      required
                    />
                  </div>

                  {/* Engine Number */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Engine Number
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.engineNumber}
                      onChange={(e) =>
                        setCarForm({ ...carForm, engineNumber: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Engine serial number"
                      required
                    />
                  </div>

                  {/* Owner Username */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Owner Username
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={carForm.ownerUsername}
                      onChange={(e) =>
                        setCarForm({ ...carForm, ownerUsername: e.target.value })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Verified user's username"
                      required
                    />
                  </div>

                  {/* Current Mileage */}
                  <div>
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Current Mileage
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      value={carForm.mileage}
                      onChange={(e) =>
                        setCarForm({
                          ...carForm,
                          mileage: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  {/* Latest Inspection Report - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-purple-200/80 text-sm font-medium mb-3">
                      Latest Inspection Report
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="url"
                      value={carForm.latestInspectionReport}
                      onChange={(e) =>
                        setCarForm({
                          ...carForm,
                          latestInspectionReport: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="https://... or ipfs://..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4 pt-6 border-t border-purple-500/20"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 border border-purple-500/30"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Register Vehicle
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



function AnalyticsDashboard({ platformStats, carStats, isLoading }: any) {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-pulse shadow-xl"
          >
            <div className="h-32 bg-purple-500/20 rounded-xl"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const keyMetrics = [
    {
      title: 'Platform Growth',
      value: platformStats?.totalUsers || 0,
      change: '+15% this month',
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Vehicle Registry',
      value: carStats?.totalCars || 0,
      change: '+8% this month',
      icon: Car,
      color: 'emerald',
      bgColor: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Market Activity',
      value: carStats?.carsForSale || 0,
      change: '+22% this week',
      icon: Activity,
      color: 'violet',
      bgColor: 'from-violet-500 to-purple-600'
    }
  ];

  const inspectionData = [
    {
      label: 'Passed',
      value: carStats?.inspectionStats?.passed || 0,
      color: 'emerald',
      icon: '✓'
    },
    {
      label: 'Pending',
      value: carStats?.inspectionStats?.pending || 0,
      color: 'amber',
      icon: '⏳'
    },
    {
      label: 'Failed',
      value: carStats?.inspectionStats?.failed || 0,
      color: 'red',
      icon: '✕'
    }
  ];

  const activityStats = [
    { label: 'Daily Active Users', value: '2,847' },
    { label: 'Monthly Transactions', value: '1,293' },
    { label: 'Average Session Time', value: '8m 32s' }
  ];

  const systemHealth = [
    { label: 'Uptime', value: '99.9%', color: 'emerald' },
    { label: 'Avg Response', value: '1.2ms', color: 'blue' },
    { label: 'Avg Gas Fee', value: '0.45 SOL', color: 'purple' },
    { label: 'Total TXs', value: '15.7k', color: 'amber' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-lg">{metric.title}</h4>
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 5 }}
                className={`p-3 bg-gradient-to-r ${metric.bgColor} rounded-xl shadow-lg`}
              >
                <metric.icon className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="text-3xl font-bold text-white"
              >
                {metric.value}
              </motion.p>
              <p className={`text-sm text-${metric.color}-400 font-medium`}>
                {metric.change}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
        >
          <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-purple-500/20 rounded-xl"
            >
              <PieChart className="w-6 h-6 text-purple-400" />
            </motion.div>
            Inspection Status Distribution
          </h4>
          <div className="space-y-4">
            {inspectionData.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`flex items-center justify-between p-4 bg-${item.color}-500/20 hover:bg-${item.color}-500/30 rounded-xl border border-${item.color}-500/30 transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  className={`text-${item.color}-400 font-bold text-xl`}
                >
                  {item.value}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
        >
          <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="p-2 bg-violet-500/20 rounded-xl"
            >
              <LineChart className="w-6 h-6 text-violet-400" />
            </motion.div>
            Platform Activity
          </h4>
          <div className="space-y-6">
            {activityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
              >
                <span className="text-purple-200/80 font-medium">{stat.label}</span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-white font-bold text-lg"
                >
                  {stat.value}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl"
      >
        <h4 className="text-white font-bold text-xl mb-8 flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-2 bg-emerald-500/20 rounded-xl"
          >
            <Activity className="w-6 h-6 text-emerald-400" />
          </motion.div>
          System Health & Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {systemHealth.map((health, index) => (
            <motion.div
              key={health.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.05 }}
              className={`text-center p-6 bg-${health.color}-500/20 hover:bg-${health.color}-500/30 rounded-2xl border border-${health.color}-500/30 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, type: "spring", bounce: 0.5 }}
                className={`text-3xl font-bold text-${health.color}-400 mb-2`}
              >
                {health.value}
              </motion.div>
              <div className="text-purple-200/70 text-sm font-medium">
                {health.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}


export default GovernmentDashboard;
