'use client'
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search,
  Clock,
  Award,
  Filter,
  FileText,
  AlertTriangle,
  Stamp
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddConformityReportModal from './conformity-report-modal';
import { useConformityExpertData } from '../hooks/use-conformity-expert-data';
import { useGetAllCars } from '../government/government-data-access';
import { useConformityReports } from './conformity-data-access';
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

interface ConformityReport {
  publicKey: string;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: string;
  conformityStatus: boolean;
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  acceptedByOwner: boolean;
  notes: string;
}

const ConformityExpertDashboard = () => {
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  // Get conformity expert data
  const { data: expertData, isLoading: expertLoading } = useConformityExpertData(publicKey);
  // Get current user data
  const { data: userData } = useGetCurrentUser();
  // Fetch cars available for conformity inspection
  const { data: cars = [], isLoading: carsLoading } = useGetAllCars();

  // Fetch conformity expert's reports
  const { data: reports = [], isLoading: reportsLoading } = useConformityReports();
  console.log("reports", reports)

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
      case 'pending': return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
      case 'valid': return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'; 
      case 'expired': return 'text-red-300 bg-red-500/20 border-red-500/30';
      case 'compliant': return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
      case 'non-compliant': return 'text-red-300 bg-red-500/20 border-red-500/30';
      case 'conditional': return 'text-orange-300 bg-orange-500/20 border-orange-500/30';
      default: return 'text-purple-300 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'valid': case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'expired': case 'non-compliant': return <AlertCircle className="w-4 h-4" />;
      case 'conditional': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 bg-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/20"
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
          >
            <Shield className="w-16 h-16 text-purple-400 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Conformity Expert Dashboard</h1>
          <p className="text-purple-200/80 leading-relaxed">Connect your wallet to access the conformity expert dashboard</p>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-700 hover:!to-violet-700 !rounded-xl !font-medium !transition-all !duration-200" />
        </motion.div>
      </div>
    );
  }

  if (expertLoading) {
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

  if (!userData?.user?.verificationStatus?.verified || !userData?.user?.role?.confirmityExpert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 bg-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/20 max-w-md"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-purple-200/80 leading-relaxed">You must be a verified conformity expert to access this dashboard</p>
          <div className="bg-amber-500/20 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-3 text-amber-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Please wait for government verification of your conformity expert account</span>
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
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/50 backdrop-blur-lg shadow-2xl border-b border-purple-500/20 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Conformity Expert Dashboard</h1>
                <p className="text-sm text-purple-200/60">Issue vehicle conformity certificates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Verified Expert</span>
              </motion.div>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-700 hover:!to-violet-700 !rounded-xl !font-medium !transition-all !duration-200" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: Shield,
              value: reports.length,
              label: "Total Reports",
              color: "purple",
              delay: 0.1
            },
            {
              icon: Clock,
              value: reports.filter(r => !r.acceptedByOwner).length,
              label: "Pending Acceptance",
              color: "amber",
              delay: 0.2
            },
            {
              icon: CheckCircle,
              value: reports.filter(r => r.conformityStatus).length,
              label: "Compliant Certificates",
              color: "emerald",
              delay: 0.3
            },
            {
              icon: AlertTriangle,
              value: reports.filter(r => !r.conformityStatus).length,
              label: "Non-Compliant",
              color: "red",
              delay: 0.4
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 bg-${stat.color}-500/20 rounded-xl`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </motion.div>
                <div className="ml-4">
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: stat.delay + 0.2 }}
                    className="text-2xl font-bold text-white"
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-purple-200/60">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cars for Conformity Check */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl mb-8 border border-purple-500/20 overflow-hidden"
        >
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Cars Available for Conformity Check</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddReportModalOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCar}
              >
                <Plus className="w-4 h-4" />
                Issue Certificate
              </motion.button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by VIN, Brand, or Model..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
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
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
                />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="text-left p-4 text-purple-200/80 font-medium"></th>
                    <th className="text-left p-4 text-purple-200/80 font-medium">Vehicle Details</th>
                    <th className="text-left p-4 text-purple-200/80 font-medium">VIN</th>
                    <th className="text-left p-4 text-purple-200/80 font-medium">Inspection Status</th>
                    <th className="text-left p-4 text-purple-200/80 font-medium">Conformity Status</th>
                    <th className="text-left p-4 text-purple-200/80 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredCars.map((car, index) => (
                      <motion.tr 
                        key={car.vin}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                        className={`cursor-pointer transition-all duration-200 border-b border-purple-500/10 ${
                          selectedCar?.vin === car.vin ? 'bg-purple-500/10' : ''
                        }`}
                        onClick={() => setSelectedCar(car)}
                      >
                        <td className="p-4">
                          <motion.input
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="radio"
                            name="selectedCar"
                            className="w-4 h-4 text-purple-500 bg-slate-700 border-purple-500/30 focus:ring-purple-400 focus:ring-2"
                            checked={selectedCar?.vin === car.vin}
                            onChange={() => setSelectedCar(car)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              whileHover={{ rotate: 5 }}
                              className="p-2 bg-slate-700/50 rounded-xl"
                            >
                              <Car className="w-5 h-5 text-purple-300" />
                            </motion.div>
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
                          <code className="text-sm bg-slate-900/50 px-3 py-1 rounded-lg text-purple-300 font-mono">
                            {car.vin}
                          </code>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${getStatusColor(Object.keys(car.inspectionStatus)[0])}`}>
                            {getStatusIcon(Object.keys(car.inspectionStatus)[0])}
                            {Object.keys(car.inspectionStatus)[0]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-purple-300/50">
                            Not Checked
                          </span>
                        </td>
                        <td className="p-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCar(car);
                              setIsAddReportModalOpen(true);
                            }}
                          >
                            <Shield className="w-4 h-4" />
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
              className="p-8 text-center text-purple-300/60"
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
              >
                <Car className="w-12 h-12 mx-auto mb-4 text-purple-400/40" />
              </motion.div>
              <p>No cars found matching your criteria</p>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Conformity Reports */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20"
        >
          <div className="p-6 border-b border-purple-500/20">
            <h2 className="text-xl font-semibold text-white">Recent Conformity Reports</h2>
          </div>

          <div className="p-6">
            {reportsLoading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
                />
                <p className="text-purple-200/60">Loading conformity reports...</p>
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {reports.map((report, index) => (
                    <motion.div 
                      key={`${report.car}-${report.reportDate}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <motion.div 
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="p-3 bg-emerald-500/20 rounded-xl"
                          >
                            <Shield className="w-6 h-6 text-emerald-400" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Conformity Certificate</h3>
                            <p className="text-purple-200/60 text-sm">
                              Issue Date: {new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Conformity Status Badge */}
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                            report.conformityStatus 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {report.conformityStatus ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Compliant</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">Non-Compliant</span>
                            </>
                          )}
                        </motion.div>
                      </div>

                      {/* Report Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4 text-purple-300/60" />
                            <span className="text-sm font-medium text-white">Vehicle Information</span>
                          </div>
                          <div className="pl-6 space-y-2 bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                            <p className="text-sm text-purple-200/80">
                              <span className="font-medium">Car ID:</span> 
                              <code className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded text-purple-300">
                                {report.car.slice(0, 8)}...{report.car.slice(-8)}
                              </code>
                            </p>
                            <p className="text-sm text-purple-200/80">
                              <span className="font-medium">Owner:</span> 
                              <code className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded text-purple-300">
                                {report.carOwner.slice(0, 8)}...{report.carOwner.slice(-8)}
                              </code>
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-purple-300/60" />
                            <span className="text-sm font-medium text-white">Certification Details</span>
                          </div>
                          <div className="pl-6 space-y-2 bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                            <p className="text-sm text-purple-200/80">
                              <span className="font-medium">Status:</span> 
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                report.acceptedByOwner ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {report.acceptedByOwner ? 'Accepted' : 'Pending Acceptance'}
                              </span>
                            </p>
                            <p className="text-sm text-purple-200/80">
                              <span className="font-medium">Stamp:</span> 
                              <code className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded text-purple-300">
                                {report.minesStamp}
                              </code>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Modifications Required */}
                      {report.modifications && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-6"
                        >
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-white">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Required Modifications:
                          </h4>
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-sm text-amber-200">{report.modifications}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Notes */}
                      {report.notes && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-purple-500/20"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-medium text-white">Expert Notes</h4>
                            <div className="w-px h-4 bg-purple-500/30" />
                
                            <span className="text-xs text-purple-200/60">Additional Comments</span>
                          </div>
                          <p className="text-sm text-purple-200/80 italic">
                            "{report.notes}"
                          </p>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-purple-300/50">
                          Expert: {report.confirmityExpert.slice(0, 8)}...{report.confirmityExpert.slice(-8)}
                        </div>
                        <div className="flex gap-3">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
                            onClick={() => window.open(report.fullReportUri, '_blank')}
                          >
                            <FileText className="w-4 h-4" />
                            View Certificate
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
                          >
                            <Stamp className="w-4 h-4" />
                            Verify Stamp
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                  <Shield className="w-12 h-12 text-purple-400/50" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">No Certificates Issued</h3>
                <p className="text-purple-200/60 mb-6 leading-relaxed">
                  You haven't issued any conformity certificates yet. Start by selecting a vehicle for conformity check.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg mx-auto"
                  onClick={() => setIsAddReportModalOpen(true)}
                  disabled={!selectedCar}
                >
                  <Shield className="w-4 h-4" />
                  Issue First Certificate
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Conformity Report Modal */}
      <AnimatePresence>
        {selectedCar && isAddReportModalOpen && (
          <AddConformityReportModal
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

export default ConformityExpertDashboard;
