// src/components/government/government-dashboard.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  Calendar,
  MapPin,
  FileText,
  Settings,
  Database,
  Zap,
  Award,
  Target,
  PieChart,
  LineChart,
  Globe,
  Lock,
  Unlock,
  UserX,
  CarFront,
  ClipboardCheck,
  Briefcase,
  Building,
  Sparkles,
  Tag,
  ExternalLink,
  Copy
} from 'lucide-react';
import {
  useGetPendingUsers,
  useVerifyUser,
  useGetAllUsers,
  useGetPlatformStatistics,
  useRejectUser,
  useGetGovernmentProfile
} from './government-data-access';
import {
  useRegisterCar,
  useGetAllCars,
  useGetCarStatistics
} from './government-data-access';
import { ExplorerLink } from '../cluster/cluster-ui';
import { ellipsify } from '../ui/ui-layout';
import toast from 'react-hot-toast';

export function GovernmentDashboard() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
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
  const isGovernment = true;

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">Government Access Required</h2>
          <p className="text-white/70 text-center">Please connect your government wallet to access the dashboard</p>
        </div>
      </div>
    );
  }

  if (!isGovernment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">Access Denied</h2>
          <p className="text-white/70 text-center">This dashboard is restricted to government officials only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Government Dashboard</h1>
                <p className="text-xs text-white/60">Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/80 font-medium">
                  {governmentProfileQuery.data?.userName || 'Government Official'}
                </p>
                <p className="text-xs text-white/60">
                  {ellipsify(publicKey.toString())}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white/5 backdrop-blur-lg rounded-xl p-1 mb-8 border border-white/10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'cars', label: 'Car Registration', icon: Car },
            { id: 'statistics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
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
            onVerifyUser={({userPublicKey, username}: {userPublicKey: string, username: string}) => {
              verifyUserMutation.mutate({userPublicKey, username}, {
                onSuccess: () => {
                  toast.success('User verified successfully!');
                  pendingUsersQuery.refetch();
                  allUsersQuery.refetch();
                },
                onError: (error) => {
                  toast.error('Failed to verify user');
                  console.error('Verification error:', error);
                }
              });
            }}
            onRejectUser={(userId: string, reason: string) => {
              rejectUserMutation.mutate({ userId, reason }, {
                onSuccess: () => {
                  toast.success('User rejected');
                  pendingUsersQuery.refetch();
                },
                onError: (error) => {
                  toast.error('Failed to reject user');
                  console.error('Rejection error:', error);
                }
              });
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
                }
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
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ platformStats, carStats, pendingUsersCount, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
            <div className="h-12 w-12 bg-white/20 rounded-lg mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-6 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: platformStats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      title: 'Pending Verifications',
      value: pendingUsersCount,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      change: '+3',
      urgent: pendingUsersCount > 0,
    },
    {
      title: 'Registered Cars',
      value: carStats?.totalCars || 0,
      icon: Car,
      color: 'from-green-500 to-emerald-500',
      change: '+8%',
    },
    {
      title: 'Cars for Sale',
      value: carStats?.carsForSale || 0,
      icon: Tag,
      color: 'from-purple-500 to-pink-500',
      change: '+15%',
    },
    {
      title: 'Verified Users',
      value: platformStats?.verifiedUsers || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      change: '+5%',
    },
    {
      title: 'Active Inspectors',
      value: platformStats?.activeInspectors || 0,
      icon: Shield,
      color: 'from-indigo-500 to-purple-500',
      change: '+2',
    },
    {
      title: 'Total Inspections',
      value: carStats?.totalInspections || 0,
      icon: ClipboardCheck,
      color: 'from-teal-500 to-cyan-500',
      change: '+25%',
    },
    {
      title: 'Platform Revenue',
      value: `$${(platformStats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-rose-500 to-pink-500',
      change: '+18%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group ${
              stat.urgent ? 'ring-2 ring-yellow-400/50 animate-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.change && (
                <span className="text-xs text-green-400 font-medium bg-green-400/20 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all border border-blue-400/30">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Verify Pending Users</span>
            {pendingUsersCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingUsersCount}
              </span>
            )}
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all border border-green-400/30">
            <Plus className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Register New Car</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all border border-purple-400/30">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">View Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { type: 'user_verified', user: 'Ahmed Mohammed', time: '2 minutes ago', icon: CheckCircle, color: 'text-green-400' },
            { type: 'car_registered', car: 'Toyota Camry 2023', time: '5 minutes ago', icon: Car, color: 'text-blue-400' },
            { type: 'inspection_completed', inspector: 'Sarah Wilson', time: '10 minutes ago', icon: Shield, color: 'text-purple-400' },
            { type: 'user_pending', user: 'Mohammed Ali', time: '15 minutes ago', icon: Clock, color: 'text-yellow-400' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-white text-sm">
                  {activity.type === 'user_verified' && `User ${activity.user} has been verified`}
                  {activity.type === 'car_registered' && `New car ${activity.car} registered`}
                  {activity.type === 'inspection_completed' && `Inspection completed by ${activity.inspector}`}
                  {activity.type === 'user_pending' && `New user ${activity.user} pending verification`}
                </p>
                <p className="text-white/60 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement({
  pendingUsers,
  allUsers,
  onVerifyUser,
  onRejectUser,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}: any) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.publicKey.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'pending' && !user.isVerified);
    
    return matchesSearch && matchesFilter;
  });
  console.log(allUsers)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/20 rounded w-1/4"></div>
            <div className="h-12 bg-white/20 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Pending User Verifications</h3>
              <p className="text-white/80">
                {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} waiting for verification
              </p>
            </div>
            <button
              onClick={() => setFilterStatus('pending')}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
      <div className="p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            User Management
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">User</th>
                <th className="text-left p-4 text-white/70 font-medium">Status</th>
                <th className="text-left p-4 text-white/70 font-medium">Role</th>
                <th className="text-left p-4 text-white/70 font-medium">Registration Date</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any, index: number) => (
                <tr key={user.publicKey} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.userName}</p>
                        <p className="text-white/60 text-sm">{ellipsify(user.publicKey)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.isVerified 
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                    }`}>
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
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white/80">
                      {user.role?.confirmityExpert? 'confirmity expert' : user.role?.inspector? 'Inspector' : 'Regular User'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white/80">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/20 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!user.isVerified && (
                        <>
                          <button
                            onClick={() => onVerifyUser({userPublicKey: user.authority, username: user.userName})}
                            className="text-green-400 hover:text-green-300 p-1 hover:bg-green-400/20 rounded transition-colors"
                            title="Verify User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectUser(user.publicKey, 'Manual rejection')}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/20 rounded transition-colors"
                            title="Reject User"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-slate-800 border border-white/20 max-w-2xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
                onClick={() => setShowUserDetails(false)}
              >
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg text-white mb-4">User Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm">Username</label>
                  <p className="text-white font-medium">{selectedUser.userName}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Status</label>
                  <p className={`font-medium ${selectedUser.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Role</label>
                  <p className="text-white">
                    {selectedUser.role?.government ? 'Government Official' : 
                     selectedUser.role?.inspector ? 'Inspector' : 'Regular User'}
                  </p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Registration Date</label>
                  <p className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm">Wallet Address</label>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-sm">{selectedUser.publicKey}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedUser.publicKey)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <ExplorerLink path={`account/${selectedUser.publicKey}`} label="View on Explorer" />
                </div>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

// Car Registration Component
function CarRegistration({
  allCars,
  onRegisterCar,
  isLoading,
  showModal,
  setShowModal
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
    latestInspectionReport: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterCar(carForm);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-green-400" />
              Car Registration Center
            </h3>
            <p className="text-white/70 mt-1">Register new vehicles and manage existing ones</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Register New Car
          </button>
        </div>
      </div>

      {/* Cars List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h4 className="text-lg font-bold text-white">Registered Vehicles</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Vehicle</th>
                <th className="text-left p-4 text-white/70 font-medium">VIN</th>
                <th className="text-left p-4 text-white/70 font-medium">Owner</th>
                <th className="text-left p-4 text-white/70 font-medium">Inspection Status</th>
              </tr>
            </thead>
            <tbody>
              {allCars?.map((car: any, index: number) => (
                <tr key={car?.publicKey} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{car?.brand} {car?.model}</p>
                        <p className="text-white/60 text-sm">{car?.year} • {car?.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-white/80 text-sm bg-white/10 px-2 py-1 rounded">
                      {car?.vin}
                    </code>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80">{ellipsify(car.owner.toString())}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      car?.inspectionStatus === 'passed'
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : car?.inspectionStatus === 'failed' 
                        ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                        : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                    }`}>
                      {car?.inspectionStatus === 'passed' && <CheckCircle className="w-3 h-3" />}
                      {car?.inspectionStatus === 'failed' && <XCircle className="w-3 h-3" />}
                      {car?.inspectionStatus === 'pending' && <Clock className="w-3 h-3" />}
                      {typeof car?.inspectionStatus === 'string' ? car.inspectionStatus : 'Pending'}
                    </span>
                  </td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Car Registration Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-slate-800 border border-white/20 max-w-4xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </form>
            
            <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-400" />
              Register New Vehicle
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Car ID</label>
                  <input
                    type="text"
                    value={carForm.carId}
                    onChange={(e) => setCarForm({...carForm, carId: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., CAR001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">VIN Number</label>
                  <input
                    type="text"
                    value={carForm.vin}
                    onChange={(e) => setCarForm({...carForm, vin: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="17-character VIN"
                    required
                    maxLength={17}
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={carForm.brand}
                    onChange={(e) => setCarForm({...carForm, brand: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Model</label>
                  <input
                    type="text"
                    value={carForm.model}
                    onChange={(e) => setCarForm({...carForm, model: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Year</label>
                  <input
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({...carForm, year: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Color</label>
                  <input
                    type="text"
                    value={carForm.color}
                    onChange={(e) => setCarForm({...carForm, color: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., White"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Engine Number</label>
                  <input
                    type="text"
                    value={carForm.engineNumber}
                    onChange={(e) => setCarForm({...carForm, engineNumber: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Engine serial number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Owner Username</label>
                  <input
                    type="text"
                    value={carForm.ownerUsername}
                    onChange={(e) => setCarForm({...carForm, ownerUsername: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Verified user's username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Current Mileage</label>
                  <input
                    type="number"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({...carForm, mileage: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Latest Inspection Report</label>
                  <input
                    type="url"
                    value={carForm.latestInspectionReport}
                    onChange={(e) => setCarForm({...carForm, latestInspectionReport: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://... or ipfs://..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard({ platformStats, carStats, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
            <div className="h-32 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Platform Growth</h4>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">{platformStats?.totalUsers || 0}</p>
            <p className="text-sm text-green-400">+15% this month</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Vehicle Registry</h4>
            <Car className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">{carStats?.totalCars || 0}</p>
            <p className="text-sm text-blue-400">+8% this month</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Market Activity</h4>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">{carStats?.carsForSale || 0}</p>
            <p className="text-sm text-purple-400">+22% this week</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Inspection Status Distribution
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-400/20 rounded-lg">
              <span className="text-white">Passed</span>
              <span className="text-green-400 font-bold">{carStats?.inspectionStats?.passed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-400/20 rounded-lg">
              <span className="text-white">Pending</span>
              <span className="text-yellow-400 font-bold">{carStats?.inspectionStats?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-400/20 rounded-lg">
              <span className="text-white">Failed</span>
              <span className="text-red-400 font-bold">{carStats?.inspectionStats?.failed || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            Platform Activity
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Daily Active Users</span>
              <span className="text-white font-bold">2,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Monthly Transactions</span>
              <span className="text-white font-bold">1,293</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Average Session Time</span>
              <span className="text-white font-bold">8m 32s</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          System Health & Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-400/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">99.9%</div>
            <div className="text-white/70 text-sm">Uptime</div>
          </div>
          <div className="text-center p-4 bg-blue-400/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">1.2ms</div>
            <div className="text-white/70 text-sm">Avg Response</div>
          </div>
          <div className="text-center p-4 bg-purple-400/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">0.45 SOL</div>
            <div className="text-white/70 text-sm">Avg Gas Fee</div>
          </div>
          <div className="text-center p-4 bg-yellow-400/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">15.7k</div>
            <div className="text-white/70 text-sm">Total TXs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GovernmentDashboard;
