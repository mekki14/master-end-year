// components/CarDetailsModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Gauge, 
  Palette, 
  User, 
  FileText, 
  Shield, 
  DollarSign,
  Settings,
  Share2,
  Heart,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  MessageSquare,
  History,
  Wrench
} from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface CarDetailsModalProps {
  car: {
    publicKey: string;
    carId: string;
    vin: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    engineNumber: string;
    owner: string;
    ownerName: string;
    mileage: number;
    salePrice: number;
    isForSale: boolean;
    lastInspectionDate: string | null;
    inspectionStatus: 'valid' | 'pending' | 'expired';
    description: string;
    features: string[];
    createdAt: string;
    latestInspectionReport?: {
      reportDate: string;
      conformityStatus: 'approved' | 'rejected' | 'conditional';
      inspectorName: string;
      notes: string;
    };
    history?: Array<{
      date: string;
      event: string;
      details: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
  onBuyRequest: () => void;
  currentUserPublicKey?: string;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({
  car,
  isOpen,
  onClose,
  onBuyRequest,
  currentUserPublicKey,
}) => {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'history'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const isOwner = currentUserPublicKey === car.owner;
  const priceInSOL = car.salePrice / LAMPORTS_PER_SOL;

  const getInspectionStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'expired': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getInspectionIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'expired': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${car.brand} ${car.model} ${car.year}`,
        text: `Check out this ${car.brand} ${car.model} for sale`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-gray-800 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Car className="w-7 h-7 text-indigo-400 mr-3" />
              {car.brand} {car.model} {car.year}
            </h2>
            <p className="text-gray-400 flex items-center mt-1">
              <span className="mr-4">VIN: {car.vin}</span>
              <span>ID: #{car.carId}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`btn btn-circle ${isFavorite ? 'btn-error text-white' : 'btn-ghost text-gray-300'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="btn btn-circle btn-ghost text-gray-300">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="btn btn-circle btn-ghost text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="p-6">
            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-3xl shadow-lg">
                <DollarSign className="w-8 h-8 mr-2" />
                {priceInSOL.toFixed(2)} SOL
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-6 rounded-xl border border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-400 font-medium">Year</p>
                    <p className="text-2xl font-bold text-blue-100">{car.year}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-6 rounded-xl border border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-400 font-medium">Mileage</p>
                    <p className="text-2xl font-bold text-green-100">{car.mileage.toLocaleString()}</p>
                  </div>
                  <Gauge className="w-10 h-10 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-xl border border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-400 font-medium">Color</p>
                    <p className="text-2xl font-bold text-purple-100 capitalize">{car.color}</p>
                  </div>
                  <Palette className="w-10 h-10 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Inspection Status */}
            <div className={`p-6 rounded-xl border-2 mb-8 bg-gray-800/50 border-gray-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* {getInspectionIcon(car.inspectionStatus)} */}
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-wide text-gray-300">
                      Inspection Status
                    </p>
                    {/* <p className="font-bold capitalize text-white text-lg">{car.inspectionStatus}</p> */}
                  </div>
                </div>
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
              {/* {car.lastInspectionDate && (
                <p className="text-sm mt-3 text-gray-400">
                  Last inspection: {new Date(car.lastInspectionDate).toLocaleDateString()}
                </p>
              )} */}
            </div>

            {/* Owner Info */}
            <div className="bg-gray-800 p-6 rounded-xl mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{car.ownerName}</p>
                  <p className="text-sm text-gray-400">Vehicle Owner</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-400 ml-1">4.8 (24 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed bg-gray-800 mb-8">
              <button 
                className={`tab text-gray-400 ${activeTab === 'overview' ? 'tab-active bg-indigo-900/50 text-white' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab text-gray-400 ${activeTab === 'inspection' ? 'tab-active bg-indigo-900/50 text-white' : ''}`}
                onClick={() => setActiveTab('inspection')}
              >
                Inspection
              </button>
              <button 
                className={`tab text-gray-400 ${activeTab === 'history' ? 'tab-active bg-indigo-900/50 text-white' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                 

                  {/* Technical Details */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center text-lg">
                      <Settings className="w-6 h-6 mr-3 text-indigo-400" />
                      Technical Details
                    </h4>
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Engine Number</span>
                          <span className="font-medium text-white">{car.engineNumber}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">VIN</span>
                          <span className="font-medium text-white font-mono">{car.vin}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-gray-400">Registration Date</span>
                          <span className="font-medium text-white">{new Date(car.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-6">
                  {car.latestInspectionReport ? (
                    <div className="border border-gray-700 rounded-xl p-6 bg-gray-800">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-white text-lg">Latest Inspection Report</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          car.latestInspectionReport.conformityStatus === 'approved' 
                            ? 'bg-green-900/50 text-green-200 border border-green-700'
                            : car.latestInspectionReport.conformityStatus === 'rejected'
                            ? 'bg-red-900/50 text-red-200 border border-red-700'
                            : 'bg-yellow-900/50 text-yellow-200 border border-yellow-700'
                        }`}>
                          {car.latestInspectionReport.conformityStatus}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Inspector</span>
                          <span className="font-medium text-white">{car.latestInspectionReport.inspectorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date</span>
                          <span className="font-medium text-white">
                            {new Date(car.latestInspectionReport.reportDate).toLocaleDateString()}
                          </span>
                        </div>
                        {car.latestInspectionReport.notes && (
                          <div>
                            <span className="text-gray-400 block mb-3">Notes</span>
                            <p className="text-gray-300 bg-gray-700/50 p-4 rounded-lg leading-relaxed">
                              {car.latestInspectionReport.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg">No inspection reports available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {car.history?.length ? (
                    car.history.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-6 border border-gray-700 rounded-xl bg-gray-800">
                        <div className="w-3 h-3 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-lg">{event.event}</p>
                          <p className="text-gray-400 mb-2">{event.details}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg">No history records available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-gray-900 pt-6 border-t border-gray-800">
              {!isOwner && car.isForSale ? (
                <div className="flex space-x-4">
                  <button className="btn btn-outline text-gray-300 border-gray-600 hover:bg-gray-800 flex-1 text-lg py-3">
                    <MessageSquare className="w-6 h-6 mr-2" />
                    Contact Owner
                  </button>
                  <button 
                    onClick={onBuyRequest}
                    className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none flex-1 text-lg py-3"
                  >
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Make Offer
                  </button>
                </div>
              ) : isOwner ? (
                <div className="alert bg-blue-900/50 text-blue-200 border border-blue-800">
                  <Car className="w-6 h-6" />
                  <div>
                    <div className="font-medium">This is your car</div>
                    <div className="text-sm opacity-80">Manage it from your dashboard</div>
                  </div>
                </div>
              ) : (
                <div className="alert bg-yellow-900/50 text-yellow-200 border border-yellow-800">
                  <AlertCircle className="w-6 h-6" />
                  <div>
                    <div className="font-medium">Not for sale</div>
                    <div className="text-sm opacity-80">This car is not currently available for purchase</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;
