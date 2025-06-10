// src/components/car/car-account-ui.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect, useRef } from 'react';
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
        console.log("vin",vin)
        console.log("requestId",requestId)
        console.log("response",response)
      await respondToRequestMutation.mutateAsync({ vin, buyRequestPubkey: requestId, accept: response });
      toast.success(`Buy request ${response}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${response} buy request`);
    }
  };

  const getInspectionStatusColor = (status: CarInspectionStatus) => {
    switch (status) {
      case 'passed':
        return 'badge-success';
      case 'failed':
        return 'badge-error';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-ghost';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Car Registry</h1>
            <p className="text-gray-400">
              Manage your registered cars and ownership
            </p>
          </div>

          {/* Total Requests Counter */}
          {pendingBuyRequests.length > 0 && (
            <div className="bg-warning/20 border border-warning/40 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-warning animate-pulse" />
                <span className="text-warning font-semibold">
                  {pendingBuyRequests.length} Pending Buy Request
                  {pendingBuyRequests.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

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
      <div className="text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-base-100 rounded-full p-8 shadow-2xl border border-purple-500/20">
            <Wallet className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <Sparkles className="w-6 h-6 absolute top-2 right-2 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Car Registry</h1>
        <p className="text-gray-400 text-lg mb-8">
          Connect your wallet to manage your car registry
        </p>
        <div className="alert alert-info max-w-md mx-auto">
          <Shield className="w-5 h-5" />
          <span>Secure blockchain-based car ownership system</span>
        </div>
      </div>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Cars</h2>
        <div className="text-sm text-gray-400">
          {userCarsQuery.data?.length || 0} car
          {userCarsQuery.data?.length !== 1 ? 's' : ''} registered
        </div>
      </div>

      {userCarsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-base-300 rounded w-3/4"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2"></div>
                  <div className="h-4 bg-base-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : userCarsQuery.error ? (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading cars: {userCarsQuery.error.message}</span>
        </div>
      ) : userCarsQuery.data?.length === 0 ? (
        <div className="text-center py-16">
          <Car className="w-16 h-16 mx-auto text-base-content/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Cars Registered</h3>
          <p className="text-base-content/60 mb-4">
            You don't have any cars registered yet. Contact the government to
            register your first car.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {userCarsQuery.data?.map((car: any, index: number) => (
            <div key={car.carId || index} className="space-y-0">
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

              {/* Buy Requests Section - Positioned under the car */}
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
            </div>
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

  // Get buy requests for this specific car
  const carBuyRequests = allBuyRequests.filter(
    (req: BuyRequest) => req.carVin === car.vin
  );

  const pendingRequests = carBuyRequests.filter(
    (r: BuyRequest) => r.status === 'pending'
  );
  const isExpanded = expandedCarVin === car.vin;

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/50 group">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="card-title text-xl mb-2 group-hover:text-primary transition-colors">
              <Car className="w-6 h-6" />
              {car.brand} {car.model}
            </h2>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Calendar className="w-4 h-4" />
              <span>{car.year}</span>
              <span className="w-1 h-1 bg-base-content/30 rounded-full"></span>
              <span className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border-2 border-base-content/20"
                  style={{
                    backgroundColor: car.color?.toLowerCase() || '#gray',
                  }}
                ></div>
                {car.color}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`badge ${getInspectionStatusColor(
                car.inspectionStatus
              )} gap-1 text-xs`}
            >
              {getInspectionStatusIcon(car.inspectionStatus)}
              {car.inspectionStatus}
            </div>
            {car.isForSale && (
              <div className="badge badge-success badge-sm">For Sale</div>
            )}
          </div>
        </div>

        {/* Car Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <KeyRound className="w-4 h-4 text-base-content/60" />
              <span className="text-base-content/60">VIN:</span>
            </div>
            <code className="text-xs bg-base-200 px-2 py-1 rounded block truncate">
              {car.vin}
            </code>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4 text-base-content/60" />
              <span className="text-base-content/60">Engine:</span>
            </div>
            <code className="text-xs bg-base-200 px-2 py-1 rounded block truncate">
              {car.engineNumber}
            </code>
          </div>
        </div>

        {/* Reports Summary */}
        <div className="bg-base-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reports & Inspections</span>
            {car.lastInspectionDate && (
              <span className="text-xs text-base-content/60">
                Last:{' '}
                {new Date(car.lastInspectionDate * 1000).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-base-content/60">
            <span className="flex items-center gap-1">
              <ClipboardCheck className="w-3 h-3" />
              {car.inspectionReportsCount || 0} Inspections
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {car.conformityReportsCount || 0} Conformity
            </span>
          </div>
        </div>

        {/* Buy Requests Indicator */}
        {car.isForSale && carBuyRequests.length > 0 && (
          <div
            className={`rounded-lg p-3 mb-4 border cursor-pointer transition-all duration-300 ${
              isExpanded
                ? 'bg-primary/20 border-primary/40 shadow-lg'
                : 'bg-warning/10 border-warning/20 hover:bg-warning/20'
            }`}
            onClick={() => toggleBuyRequestsExpansion(car.vin)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell
                  className={`w-4 h-4 ${
                    isExpanded ? 'text-primary' : 'text-warning'
                  } ${
                    !isExpanded && pendingRequests.length > 0
                      ? 'animate-pulse'
                      : ''
                  }`}
                />
                <span
                  className={`font-medium ${
                    isExpanded ? 'text-primary' : 'text-warning'
                  }`}
                >
                  {carBuyRequests.length} Buy Request
                  {carBuyRequests.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pendingRequests.length > 0 && (
                  <div
                    className={`badge badge-sm ${
                      isExpanded ? 'badge-primary' : 'badge-warning'
                    }`}
                  >
                    {pendingRequests.length} pending
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-warning" />
                )}
              </div>
            </div>

            {!isExpanded && pendingRequests.length > 0 && (
              <div className="mt-2 pt-2 border-t border-warning/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-warning/80">Highest Offer:</span>
                  <span className="font-semibold text-warning">
                    {Math.max(
                      ...pendingRequests.map((r: BuyRequest) => r.offeredPrice)
                    )}{' '}
                    SOL
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Display */}
        {car.isForSale && (
          <div className="bg-success/10 rounded-lg p-3 mb-4 border border-success/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="font-medium text-success">Listed Price</span>
              </div>
              <span className="text-xl font-bold text-success">
                {car.salePrice ? `${car.salePrice} SOL` : 'Price not set'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end gap-2">
          <button
            onClick={() => setShowFullDetails(true)}
            className="btn btn-outline btn-sm gap-1 hover:scale-105 transition-transform"
          >
            <Eye className="w-3 h-3" />
            Details
          </button>

          <button
            onClick={() =>
              handleToggleSale(car.vin, car.isForSale, car.salePrice || 0)
            }
            className={`btn btn-sm gap-1 hover:scale-105 transition-transform ${
              car.isForSale ? 'btn-warning' : 'btn-success'
            }`}
            disabled={toggleSaleMutation.isPending}
          >
            {toggleSaleMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : car.isForSale ? (
              <>
                <X className="w-3 h-3" />
                Remove Sale
              </>
            ) : (
              <>
                <DollarSign className="w-3 h-3" />
                List for Sale
              </>
            )}
          </button>
        </div>
      </div>

      {/* Car Details Modal */}
      {showFullDetails && (
        <CarDetailsModal car={car} onClose={() => setShowFullDetails(false)} />
      )}
    </div>
  );
}

// Buy Requests Section Component - Positioned under the car
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
  onRespondToRequest: (
    vin: string,
    requestId: string,
    response: 'accept' | 'reject'
  ) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  // Filter to only show pending and rejected requests
  const filteredRequests = buyRequests.filter(
    (request) => request.status === 'pending' || request.status === 'rejected'
  );

  const pendingCount = buyRequests.filter((r) => r.status === 'pending').length;
  const rejectedCount = buyRequests.filter(
    (r) => r.status === 'rejected'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'unverified':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  return (
    <div className="bg-base-100 border-2 border-primary/30 rounded-b-xl shadow-2xl mx-2 -mt-2 animate-in slide-in-from-top-5 duration-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
              <HandHeart className="w-6 h-6" />
              Active Buy Requests for {car.brand} {car.model}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-warning">
                <Clock className="w-4 h-4" />
                {pendingCount} Pending
              </span>
              <span className="flex items-center gap-1 text-error">
                <XCircle className="w-4 h-4" />
                {rejectedCount} Rejected
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="alert alert-info mb-6">
          <AlertTriangle className="w-5 h-5" />
          <span>
            Only showing pending and rejected requests that may need your
            attention
          </span>
        </div>

        {/* Requests List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <HandHeart className="w-12 h-12 mx-auto text-base-content/40 mb-3" />
              <h4 className="text-lg font-semibold mb-2">
                No pending or rejected requests
              </h4>
              <p className="text-base-content/60 text-sm">
                All buy requests have been processed
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.publicKey}
                className="card bg-base-200 border border-base-300 hover:shadow-lg transition-shadow"
              >
                <div className="card-body p-4">
                  {/* Request Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span className="text-sm font-bold">
                            {request.buyerName?.charAt(0)?.toUpperCase() || 'B'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold">{request.buyerName}</h4>
                        <div className="flex items-center gap-2">
                          <div
                            className={`badge badge-xs ${getVerificationColor(
                              request.buyerVerificationStatus
                            )}`}
                          >
                            {request.buyerVerificationStatus}
                          </div>
                          {request.buyerRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-warning" />
                              <span className="text-xs">
                                {request.buyerRating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`badge mb-1 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="bg-base-300 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-base-content/60">
                          Offered Price
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {request.offeredPrice} SOL
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-base-content/60">
                          vs Listed Price
                        </div>
                        <div className="font-semibold">
                          {car.salePrice ? `${car.salePrice} SOL` : 'Not set'}
                        </div>
                        {car.salePrice && (
                          <div
                            className={`text-xs ${
                              request.offeredPrice >= car.salePrice
                                ? 'text-success'
                                : 'text-warning'
                            }`}
                          >
                            {request.offeredPrice >= car.salePrice
                              ? '✓ At or above asking'
                              : '⚠ Below asking'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="bg-base-100 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-1 text-base-content/60 flex-shrink-0" />
                        <p className="text-sm">{request.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Buyer Details */}
                  <div className="text-xs text-base-content/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span>Buyer Wallet:</span>
                      <code className="bg-base-100 px-2 py-1 rounded">
                        {ellipsify(request.buyerPublicKey)}
                      </code>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                     
                      <button
                        onClick={() =>
                          onRespondToRequest(carVin, request.publicKey, 'accept')
                        }
                        disabled={isLoading}
                        className="btn btn-success btn-sm flex-1 gap-2"
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <ThumbsUp className="w-4 h-4" />
                        )}
                        Accept
                      </button>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="alert alert-error alert-sm">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Request was rejected</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
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
        return 'badge-success';
      case 'failed':
        return 'badge-error';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-ghost';
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
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">
              {car.brand} {car.model} ({car.year})
            </h3>
            <p className="text-base-content/70">Complete vehicle information</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Details
            </h4>

            <div className="bg-base-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Brand:</span>
                <span>{car.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Model:</span>
                <span>{car.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Year:</span>
                <span>{car.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor: car.color?.toLowerCase() || '#gray',
                    }}
                  ></div>
                  <span>{car.color}</span>
                </div>
              </div>
              {car.mileage && (
                <div className="flex justify-between">
                  <span className="font-medium">Mileage:</span>
                  <span>{car.mileage?.toLocaleString()} km</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Technical Info
            </h4>

            <div className="bg-base-200 rounded-lg p-4 space-y-3">
              <div>
                <span className="font-medium">VIN:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-base-300 px-2 py-1 rounded text-xs flex-1">
                    {car.vin}
                  </code>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => copyToClipboard(car.vin)}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="font-medium">Engine Number:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-base-300 px-2 py-1 rounded text-xs flex-1">
                    {car.engineNumber}
                  </code>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => copyToClipboard(car.engineNumber)}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Status */}
        <div className="mt-6">
          <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            Inspection Status
          </h4>

          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Current Status:</span>
              <div
                className={`badge ${getInspectionStatusColor(
                  car.inspectionStatus
                )} gap-1`}
              >
                {getInspectionStatusIcon(car.inspectionStatus)}
                {car.inspectionStatus}
              </div>
            </div>

            {car.lastInspectionDate && (
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Last Inspection:</span>
                <span>
                  {new Date(car.lastInspectionDate * 1000).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-base-300 rounded">
                <div className="text-2xl font-bold">
                  {car.inspectionReportsCount || 0}
                </div>
                <div className="text-sm text-base-content/60">Inspections</div>
              </div>
              <div className="text-center p-3 bg-base-300 rounded">
                <div className="text-2xl font-bold">
                  {car.conformityReportsCount || 0}
                </div>
                <div className="text-sm text-base-content/60">
                  Conformity Reports
                </div>
              </div>
            </div>

            {car.latestInspectionReport && (
              <div className="mt-4">
                <button className="btn btn-outline btn-sm gap-1">
                  <FileText className="w-3 h-3" />
                  View Latest Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sale Information */}
        {car.isForSale && (
          <div className="mt-6">
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              Sale Information
            </h4>

            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-success">
                  Listed for Sale
                </span>
                <span className="text-xl font-bold text-success">
                  {car.salePrice ? `${car.salePrice} SOL` : 'Price not set'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Information */}
        <div className="mt-6">
          <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            Blockchain Information
          </h4>

          <div className="bg-base-200 rounded-lg p-4 space-y-3">
            <div>
              <span className="font-medium">Car ID:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-base-300 px-2 py-1 rounded text-xs flex-1">
                  {car.carId}
                </code>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => copyToClipboard(car.carId)}
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <span className="font-medium">Account Address:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-base-300 px-2 py-1 rounded text-xs flex-1">
                  {ellipsify(car.publicKey)}
                </code>
                <ExplorerLink
                  path={`account/${car.publicKey}`}
                  label="View on Explorer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarAccountFeature;
