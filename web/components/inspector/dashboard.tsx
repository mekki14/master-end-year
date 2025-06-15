'use client'
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search,
  Clock,
  Eye,
  Filter,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddReportModal from './AddReportModal';
import { useInspectorData } from '../hooks/use-inspector-data';
import { useGetAllCars } from '../government/government-data-access';
import { useInspectorReports } from './inspector-data-access';
import { useGetCurrentUser } from '../users/user-data-access';

interface CarData {
  publicKey: string;
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  owner: string;
  lastInspectionDate: string | null;
  inspectionStatus: 'pending' | 'valid' | 'expired';
  isForSale: boolean;
}

interface InspectionReport {
  publicKey: string;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: string;
  conformityStatus: 'approved' | 'rejected' | 'conditional';
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const InspectorDashboard = () => {
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  // Get inspector data
  const { data: inspectorData, isLoading: inspectorLoading } = useInspectorData(publicKey);

  // Fetch cars available for inspection
  const { data: cars = [], isLoading: carsLoading } = useGetAllCars();

  // Fetch inspector's reports
  const { data: reports = [], isLoading: reportsLoading } = useInspectorReports();

  const filteredCars = cars.filter(car => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      (car.vin?.toLowerCase() || '').includes(searchTermLower) ||
      (car.brand?.toLowerCase() || '').includes(searchTermLower) ||
      (car.model?.toLowerCase() || '').includes(searchTermLower);

    const matchesFilter = filterStatus === 'all' || 
      (car.inspectionStatus && Object.keys(car.inspectionStatus)[0] === filterStatus);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'valid': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'; 
      case 'expired': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'approved': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'conditional': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'accepted': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const statsData = [
    {
      title: 'Total Reports',
      value: reports.length,
      icon: FileText,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'purple-500/20'
    },
    {
      title: 'Pending Approval',
      value: reports.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'amber-500/20'
    },
    {
      title: 'Accepted Reports',
      value: reports.filter(r => r.status === 'accepted').length,
      icon: CheckCircle,
      color: 'from-emerald-600 to-green-600',
      bgColor: 'emerald-500/20'
    },
    {
      title: 'Cars Available',
      value: cars.length,
      icon: Car,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'blue-500/20'
    }
  ];

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl max-w-md w-full text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-6"
          >
            <Car className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Inspector Dashboard</h1>
          <p className="text-purple-200/80 mb-6 leading-relaxed">
            Connect your wallet to access the inspector dashboard
          </p>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-600 !rounded-xl !px-8 !py-3 !font-medium !shadow-lg hover:!shadow-xl !transition-all" />
        </motion.div>
      </div>
    );
  }

  if (inspectorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  if (!inspectorData?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-amber-500/30 shadow-2xl max-w-md w-full text-center"
        >
          <motion.div
            animate={{ 
              pulse: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
            }}
            className="inline-flex p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-6"
          >
            <AlertCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-purple-200/80 mb-6 leading-relaxed">
            You must be a verified inspector to access this dashboard
          </p>
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-amber-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Please wait for government verification of your inspector account</span>
            </div>
          </div>
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
          <div className="flex justify-between items-center py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-2xl shadow-lg"
              >
                <Car className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Inspector Dashboard</h1>
                <p className="text-sm text-purple-200/70">Manage vehicle inspections and reports</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 font-medium">
                <Shield className="w-4 h-4 inline mr-2" />
                Verified Inspector
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-600 !rounded-xl !font-medium !shadow-lg hover:!shadow-xl !transition-all" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="flex items-center">
                <motion.div 
                  className={`p-3 bg-${stat.bgColor} rounded-xl`}
                  whileHover={{ scale: 1.1 }}
                >
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </motion.div>
                <div className="ml-4">
                  <motion.h3 
                    className="text-2xl font-bold text-white"
                    key={stat.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-purple-200/70 font-medium">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cars for Inspection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl mb-8 border border-purple-500/30"
        >
          <div className="p-6 border-b border-purple-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Cars Available for Inspection</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddReportModalOpen(true)}
                disabled={!selectedCar}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add Report
              </motion.button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by VIN, Brand, or Model..."
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {carsLoading ? (
              <div className="p-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
                />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="p-4 text-left text-purple-200/70 font-medium"></th>
                    <th className="p-4 text-left text-purple-200/70 font-medium">Vehicle Details</th>
                    <th className="p-4 text-left text-purple-200/70 font-medium">VIN</th>
                    <th className="p-4 text-left text-purple-200/70 font-medium">Last Inspection</th>
                    <th className="p-4 text-left text-purple-200/70 font-medium">Status</th>
                    <th className="p-4 text-left text-purple-200/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredCars.map((car, index) => (
                      <motion.tr 
                        key={car.vin}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-slate-800/50 cursor-pointer transition-all duration-200 ${
                          selectedCar?.vin === car.vin ? 'bg-slate-800/50 border-l-4 border-purple-500' : ''
                        }`}
                        onClick={() => setSelectedCar(car)}
                      >
                        <td className="p-4">
                          <input
                            type="radio"
                            name="selectedCar"
                            className="w-5 h-5 text-purple-600 border-purple-300 focus:ring-purple-500"
                            checked={selectedCar?.vin === car.vin}
                            onChange={() => setSelectedCar(car)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500/20 rounded-xl">
                              <Car className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {car.brand} {car.model}
                              </div>
                              <div className="text-sm text-purple-200/60">
                                {car.year} • {car.color}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-slate-800 px-3 py-1 rounded-lg text-purple-300 font-mono">
                            {car.vin}
                          </code>
                        </td>
                        <td className="p-4">
                          {car.lastInspectionDate ? (
                            <span className="text-sm text-purple-200/80">
                              {new Date(car.lastInspectionDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-purple-200/50">Never</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-fit border ${getStatusColor(Object.keys(car.inspectionStatus)[0])}`}>
                            {getStatusIcon(Object.keys(car.inspectionStatus)[0])}
                            {Object.keys(car.inspectionStatus)[0]}
                          </span>
                        </td>
                        <td className="p-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white p-2 rounded-xl transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCar(car);
                              setIsAddReportModalOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {filteredCars.length === 0 && !carsLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center text-purple-200/60"
            >
              <Car className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
              <p className="text-lg">No cars found matching your criteria</p>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Reports */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-500/30"
        >
          <div className="p-6 border-b border-purple-500/30">
            <h2 className="text-xl font-bold text-white">Recent Reports</h2>
          </div>

          <div className="p-6">
            {reportsLoading ? (
              <div className="text-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
                />
                <p className="text-purple-200/60">Loading inspection reports...</p>
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-6">
                {reports.map((report, index) => (
                  <motion.div 
                    key={`${report.car}-${report.reportDate}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-2xl">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Inspection Report</h3>
                          <p className="text-purple-200/60 text-sm">
                            Report Date: {new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                          report.approvedByOwner ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            report.approvedByOwner ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}></div>
                          {report.approvedByOwner ? 'Approved' : 'Pending Approval'}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">Vehicle Information</span>
                        </div>
                        <div className="pl-6 space-y-2">
                          <p className="text-sm text-purple-200/80">
                            <span className="font-medium">Car ID:</span> {report.car.slice(0, 8)}...{report.car.slice(-8)}
                          </p>
                          <p className="text-sm text-purple-200/80">
                            <span className="font-medium">Owner:</span> {report.carOwner.slice(0, 8)}...{report.carOwner.slice(-8)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">Inspector</span>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm text-purple-200/80">
                            {report.inspector.slice(0, 8)}...{report.inspector.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Condition Scores */}
                    <div className="mb-6">
                      <h4 className="font-medium text-white mb-4">Condition Assessment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: 'Overall', value: report.overallCondition, icon: '🚗' },
                          { label: 'Engine', value: report.engineCondition, icon: '⚙️' },
                          { label: 'Body', value: report.bodyCondition, icon: '🔧' }
                        ].map((condition) => (
                          <div key={condition.label} className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium flex items-center space-x-2 text-white">
                                <span>{condition.icon}</span>
                                <span>{condition.label}</span>
                              </span>
                              <span className="font-bold text-lg text-white">{condition.value}/10</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(condition.value / 10) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-2 rounded-full ${
                                  condition.value >= 8 ? 'bg-emerald-500' :
                                  condition.value >= 6 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Summary */}
                    <div className="mb-6">
                      <h4 className="font-medium text-white mb-3">Summary</h4>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                        <p className="text-sm text-purple-200/80">{report.reportSummary}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {report.notes && (
                      <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-white">Additional Notes</h4>
                          <div className="w-px h-4 bg-purple-500/30" />
                          <span className="text-xs text-purple-200/60">Inspector Comments</span>
                        </div>
                        <p className="text-sm text-purple-200/80 italic">
                          "{report.notes}"
                        </p>
                      </div>
                    )}

                                     {/* Actions */}
                                     <div className="flex justify-end gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
                        onClick={() => window.open(report.fullReportUri, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
                      >
                        <FileText className="w-4 h-4" />
                        Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="bg-slate-800/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
                >
                  <FileText className="w-12 h-12 text-purple-400/50" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
                <p className="text-purple-200/60 mb-6 leading-relaxed">
                  No inspection reports have been created yet. Start by selecting a vehicle for inspection.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                  onClick={() => setIsAddReportModalOpen(true)}
                  disabled={!selectedCar}
                >
                  <FileText className="w-4 h-4" />
                  Create First Report
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Report Modal */}
      <AnimatePresence>
        {selectedCar && isAddReportModalOpen && (
          <AddReportModal
            isOpen={isAddReportModalOpen}
            onClose={() => {
              setIsAddReportModalOpen(false);
              setSelectedCar(null);
            }}
            car={selectedCar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InspectorDashboard;
