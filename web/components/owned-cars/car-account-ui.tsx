// src/components/car/car-account-ui.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Search,
  Shield,
  ShieldCheck,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wallet,
  Copy,
  ExternalLink,
  Sparkles,
  Crown,
  Eye,
  RefreshCw,
  KeyRound,
  Calendar,
  Gauge,
  Wrench,
  DollarSign,
  Tag,
  FileText,
  Settings,
  Edit3,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  Zap,
  ClipboardCheck,
  X,
  History,
  ShoppingCart,
  MessageSquare,
  User,
  HandHeart,
  Handshake,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  Star,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useGetUserCars,
  useToggleCarForSale,
  CarInspectionStatus,
  useGetBuyRequests,
  useRespondToBuyRequest,
} from './car-data-access';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Interface for buy request
interface BuyRequest {
  publicKey: string;
  carVin: string;
  buyerPublicKey: string;
  buyerName: string;
  offeredPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  buyerRating?: number;
  buyerVerificationStatus: 'verified' | 'pending' | 'unverified';
}

export function CarAccountFeature() {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);
  const [expandedCarVin, setExpandedCarVin] = useState<string>('');

  // Data hooks
  const userCarsQuery = useGetUserCars(publicKey?.toString());
  const buyRequestsQuery = useGetBuyRequests();
  const toggleSaleMutation = useToggleCarForSale();
  const respondToRequestMutation = useRespondToBuyRequest();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSale = async (
    vin: string,
    currentStatus: boolean,
    price: number
  ) => {
    try {
      await toggleSaleMutation.mutateAsync({
        vin,
        forSale: !currentStatus,
        price,
      });
      toast.success(
        currentStatus ? 'Car removed from sale' : 'Car listed for sale'
      );
    } catch (error) {
      toast.error('Failed to update car sale status');
    }
  };

  const handleRespondToBuyRequest = async (
    vin: string,
    requestId: string,
    response: 'accept' | 'reject'
  ) => {
    try {
      console.log("vin", vin);
      console.log("requestId", requestId);
      console.log("response", response);
      await respondToRequestMutation.mutateAsync({ 
        vin, 
        buyRequestPubkey: requestId, 
        accept: response 
      });
      toast.success(`Buy request ${response}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${response} buy request`);
    }
  };

  const getInspectionStatusColor = (status: CarInspectionStatus) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getInspectionStatusIcon = (status: CarInspectionStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const toggleBuyRequestsExpansion = (carVin: string) => {
    setExpandedCarVin(expandedCarVin === carVin ? '' : carVin);
  };

  if (!publicKey) {
    return <WalletConnection />;
  }

  // Get all buy requests and pending count
  const allBuyRequests = buyRequestsQuery.data || [];
  const pendingBuyRequests = allBuyRequests.filter(
    (request: BuyRequest) => request.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            >
              Car Registry
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-purple-200/70"
            >
              Manage your registered cars and ownership
            </motion.p>
          </div>

          {/* Total Requests Counter */}
          {pendingBuyRequests.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-500/20 border border-amber-400/40 rounded-2xl px-6 py-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-5 h-5 text-amber-400" />
                </motion.div>
                <span className="text-amber-300 font-semibold">
                  {pendingBuyRequests.length} Pending Buy Request
                  {pendingBuyRequests.length > 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* My Cars Section */}
        <MyCarsSection
          userCarsQuery={userCarsQuery}
          handleToggleSale={handleToggleSale}
          toggleBuyRequestsExpansion={toggleBuyRequestsExpansion}
          getInspectionStatusColor={getInspectionStatusColor}
          getInspectionStatusIcon={getInspectionStatusIcon}
          toggleSaleMutation={toggleSaleMutation}
          allBuyRequests={allBuyRequests}
          expandedCarVin={expandedCarVin}
          handleRespondToBuyRequest={handleRespondToBuyRequest}
          respondToRequestMutation={respondToRequestMutation}
        />
      </div>
    </div>
  );
}

// Wallet Connection Component
function WalletConnection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-8 relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"
          />
          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-full p-8 shadow-2xl border border-purple-500/20">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Wallet className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-2 right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Car Registry
        </h1>
        <p className="text-purple-200/70 text-lg mb-8">
          Connect your wallet to manage your car registry
        </p>
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-6 max-w-md mx-auto backdrop-blur-sm">
          <div className="flex items-center gap-3 justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-purple-200">Secure blockchain-based car ownership system</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// My Cars Section Component
function MyCarsSection({
  userCarsQuery,
  handleToggleSale,
  toggleBuyRequestsExpansion,
  getInspectionStatusColor,
  getInspectionStatusIcon,
  toggleSaleMutation,
  allBuyRequests,
  expandedCarVin,
  handleRespondToBuyRequest,
  respondToRequestMutation,
}: any) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-white">My Cars</h2>
        <div className="text-sm text-purple-200/60 bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/30">
          {userCarsQuery.data?.length || 0} car
          {userCarsQuery.data?.length !== 1 ? 's' : ''} registered
        </div>
      </motion.div>

      {userCarsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 border border-purple-500/20 rounded-3xl p-6 backdrop-blur-sm"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-700/50 rounded-2xl w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded-2xl w-1/2"></div>
                <div className="h-4 bg-slate-700/50 rounded-2xl w-2/3"></div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : userCarsQuery.error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">Error loading cars: {userCarsQuery.error.message}</span>
          </div>
        </motion.div>
      ) : userCarsQuery.data?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-6"
          >
            <Car className="w-16 h-16 mx-auto text-purple-400/40" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">No Cars Registered</h3>
          <p className="text-purple-200/60 mb-4">
            You don't have any cars registered yet. Contact the government to register your first car.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {userCarsQuery.data?.map((car: any, index: number) => (
            <motion.div
              key={car.carId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-0"
            >
              <CarCard
                car={car}
                handleToggleSale={handleToggleSale}
                toggleBuyRequestsExpansion={toggleBuyRequestsExpansion}
                getInspectionStatusColor={getInspectionStatusColor}
                getInspectionStatusIcon={getInspectionStatusIcon}
                toggleSaleMutation={toggleSaleMutation}
                allBuyRequests={allBuyRequests}
                expandedCarVin={expandedCarVin}
              />

              {/* Buy Requests Section */}
              <AnimatePresence>
                {expandedCarVin === car.vin && (
                  <BuyRequestsSection
                    carVin={car.vin}
                    car={car}
                    buyRequests={allBuyRequests.filter(
                      (req: BuyRequest) => req.carVin === car.vin
                    )}
                    onRespondToRequest={handleRespondToBuyRequest}
                    isLoading={respondToRequestMutation.isPending}
                    onClose={() => toggleBuyRequestsExpansion('')}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Enhanced Car Card Component
function CarCard({
  car,
  handleToggleSale,
  toggleBuyRequestsExpansion,
  getInspectionStatusColor,
  getInspectionStatusIcon,
  toggleSaleMutation,
  allBuyRequests,
  expandedCarVin,
}: any) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [salePrice, setSalePrice] = useState(0);
  // Get buy requests for this specific car
  const carBuyRequests = allBuyRequests.filter(
    (req: BuyRequest) => req.carVin === car.vin
  );

  const pendingRequests = carBuyRequests.filter(
    (r: BuyRequest) => r.status === 'pending'
  );
  const isExpanded = expandedCarVin === car.vin;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl shadow-xl hover:shadow-purple-500/20 transition-all duration-300 "
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <motion.h2 
              className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors mb-2 flex items-center gap-3"
              whileHover={{ x: 5 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Car className="w-6 h-6 text-purple-400" />
              </motion.div>
              {car.brand} {car.model}
            </motion.h2>
            <div className="flex items-center gap-3 text-sm text-purple-200/70">
              <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1 rounded-xl">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1 rounded-xl">
                <div
                  className="w-3 h-3 rounded-full border-2 border-purple-400/30"
                  style={{
                    backgroundColor: car.color?.toLowerCase() || '#gray',
                  }}
                />
                <span className="capitalize">{car.color}</span>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-end gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${getInspectionStatusColor(car.inspectionStatus)}`}
            >
              {getInspectionStatusIcon(car.inspectionStatus)}
              <span className="capitalize">{car.inspectionStatus}</span>
            </motion.div>
            {car.isForSale && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-semibold"
              >
                For Sale
              </motion.div>
            )}
          </div>
        </div>

        {/* Car Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            className="space-y-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 text-sm text-purple-200/60">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>VIN:</span>
            </div>
            <div className="bg-slate-800/30 border border-purple-500/20 rounded-xl p-3">
              <code className="text-xs text-purple-300 block truncate">
                {car.vin}
              </code>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 text-sm text-purple-200/60">
              <Wrench className="w-4 h-4 text-purple-400" />
              <span>Engine:</span>
            </div>
            <div className="bg-slate-800/30 border border-purple-500/20 rounded-xl p-3">
              <code className="text-xs text-purple-300 block truncate">
                {car.engineNumber}
              </code>
            </div>
          </motion.div>
        </div>

        {/* Reports Summary */}
        <motion.div 
          className="bg-slate-800/30 border border-purple-500/20 rounded-xl p-4 mb-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-200">Reports & Inspections</span>
            {car.lastInspectionDate && (
              <span className="text-xs text-purple-200/60">
                Last: {new Date(car.lastInspectionDate * 1000).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-purple-200/60">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="w-3 h-3 text-purple-400" />
              {car.inspectionReportsCount || 0} Inspections
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-purple-400" />
              {car.conformityReportsCount || 0} Conformity
            </span>
          </div>
        </motion.div>

        {/* Buy Requests Indicator */}
        {car.isForSale && carBuyRequests.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl p-4 mb-6 border cursor-pointer transition-all duration-300 ${
              isExpanded
                ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20'
                : 'bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/20'
            }`}
            onClick={() => toggleBuyRequestsExpansion(car.vin)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Bell
                    className={`w-4 h-4 ${
                      isExpanded ? 'text-purple-400' : 'text-amber-400'
                    }`}
                  />
                </motion.div>
                <span
                  className={`font-medium ${
                    isExpanded ? 'text-purple-300' : 'text-amber-300'
                  }`}
                >
                  {carBuyRequests.length} Buy Request
                  {carBuyRequests.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {pendingRequests.length > 0 && (
                  <div
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      isExpanded 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {pendingRequests.length} pending
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-purple-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFullDetails(true)}
            className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (car.isForSale) {
                handleToggleSale(car.vin, car.isForSale, salePrice || 0);
              } else {
                // Show price input modal
                setShowPriceModal(true);
              }
            }}
            disabled={toggleSaleMutation.isPending}
            className={`flex-1 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              car.isForSale
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-400/50'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
            }`}
          >
            {toggleSaleMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {car.isForSale ? 'Remove from Sale' : 'List for Sale'}
              </>
            )}
          </motion.button>

          {/* Price Input Modal */}
          {showPriceModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-white mb-4">Set Sale Price</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-purple-200 mb-2 block">Price in SOL</label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                      placeholder="Enter price in SOL"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPriceModal(false)}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl px-4 py-2"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleToggleSale(car.vin, car.isForSale, salePrice);
                        setShowPriceModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl px-4 py-2"
                    >
                      Confirm
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Car Details Modal */}
      {showFullDetails && (
        <CarDetailsModal
          car={car}
          onClose={() => setShowFullDetails(false)}
        />
      )}
    </motion.div>
  );
}

// Buy Requests Section Component
function BuyRequestsSection({
  carVin,
  car,
  buyRequests,
  onRespondToRequest,
  isLoading,
  onClose,
}: {
  carVin: string;
  car: any;
  buyRequests: BuyRequest[];
  onRespondToRequest: (carVin: string, requestId: string, response: 'accept' | 'reject') => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'unverified':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const filteredRequests = buyRequests.filter(request => 
    request.status === 'pending' || request.status === 'rejected'
  );

  const pendingCount = buyRequests.filter(r => r.status === 'pending').length;
  const rejectedCount = buyRequests.filter(r => r.status === 'rejected').length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border-2 border-purple-400/30 rounded-b-3xl shadow-2xl shadow-purple-500/10 mx-2 -mt-2"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold flex items-center gap-3 text-purple-300"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <HandHeart className="w-6 h-6 text-purple-400" />
              </motion.div>
              Active Buy Requests for {car.brand} {car.model}
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 mt-2 text-sm"
            >
              <span className="flex items-center gap-2 text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl">
                <Clock className="w-4 h-4" />
                {pendingCount} Pending
              </span>
              <span className="flex items-center gap-2 text-red-300 bg-red-500/10 px-3 py-1 rounded-xl">
                <XCircle className="w-4 h-4" />
                {rejectedCount} Rejected
              </span>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-2 transition-all duration-200"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Notice Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 text-sm">
              Only showing pending and rejected requests that may need your attention
            </span>
          </div>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-4"
              >
                <MessageSquare className="w-12 h-12 mx-auto text-purple-400/40" />
              </motion.div>
              <p className="text-purple-200/60">No pending or rejected requests for this car</p>
            </motion.div>
          ) : (
            filteredRequests.map((request, index) => (
              <motion.div
                key={request.publicKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300"
              >
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 rounded-full p-2">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {request.buyerName || 'Anonymous Buyer'}
                      </h4>
                      <p className="text-sm text-purple-200/60">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status & Verification Badges */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs border ${getVerificationColor(request.buyerVerificationStatus)}`}>
                      {request.buyerVerificationStatus}
                    </div>
                  </div>
                </div>

                {/* Offer Price */}
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl p-4 mb-4 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-purple-200">Offered Price</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-300">
                      {request.offeredPrice} SOL
                    </span>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-slate-700/30">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5" />
                      <span className="text-sm font-medium text-purple-200">Message</span>
                    </div>
                    <p className="text-sm text-purple-200/80 ml-6">
                      {request.message}
                    </p>
                  </div>
                )}

                {/* Buyer Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-200">Buyer Address</span>
                    </div>
                    <code className="text-xs text-purple-300 block truncate">
                      {request.buyerPublicKey}
                    </code>
                  </div>
                  
                  {request.buyerRating && (
                    <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-medium text-purple-200">Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < request.buyerRating! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-purple-300 ml-2">
                          {request.buyerRating}/5
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRespondToRequest(carVin, request.publicKey, 'reject')}
                      disabled={isLoading}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-400/50 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ThumbsDown className="w-4 h-4" />
                      )}
                      Reject
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRespondToRequest(carVin, request.publicKey, 'accept')}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4" />
                      )}
                      Accept
                    </motion.button>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300">Request was rejected</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Car Details Modal Component
function CarDetailsModal({ car, onClose }: { car: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInspectionStatusColor = (status: CarInspectionStatus) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getInspectionStatusIcon = (status: CarInspectionStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {car.brand} {car.model} ({car.year})
              </h3>
              <p className="text-purple-200/70">Complete vehicle information</p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-3 transition-all duration-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-lg flex items-center gap-2 text-purple-300">
                <Car className="w-5 h-5 text-purple-400" />
                Vehicle Details
              </h4>

              <div className="bg-slate-800/30 border border-purple-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200">Brand:</span>
                  <span className="text-white">{car.brand}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200">Model:</span>
                  <span className="text-white">{car.model}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200">Year:</span>
                  <span className="text-white">{car.year}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200">Color:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-purple-500/30"
                      style={{
                        backgroundColor: car.color?.toLowerCase() || '#gray',
                      }}
                    />
                    <span className="text-white capitalize">{car.color}</span>
                  </div>
                </div>
                {car.mileage && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-200">Mileage:</span>
                    <span className="text-white">{car.mileage?.toLocaleString()} km</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Technical Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-lg flex items-center gap-2 text-purple-300">
                <Settings className="w-5 h-5 text-purple-400" />
                Technical Info
              </h4>

              <div className="bg-slate-800/30 border border-purple-500/20 rounded-2xl p-6 space-y-4">
                <div>
                  <span className="font-medium text-purple-200">VIN:</span>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-slate-800/50 border border-purple-500/20 px-3 py-2 rounded-xl text-xs flex-1 text-purple-300">
                      {car.vin}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl p-2 transition-all duration-200"
                      onClick={() => copyToClipboard(car.vin)}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-purple-200">Engine Number:</span>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-slate-800/50 border border-purple-500/20 px-3 py-2 rounded-xl text-xs flex-1 text-purple-300">
                      {car.engineNumber}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl p-2 transition-all duration-200"
                      onClick={() => copyToClipboard(car.engineNumber)}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200">Inspection Status:</span>
                  <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${getInspectionStatusColor(car.inspectionStatus)}`}>
                    {getInspectionStatusIcon(car.inspectionStatus)}
                    <span className="capitalize">{car.inspectionStatus}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
