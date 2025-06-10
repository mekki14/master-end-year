// components/CarCard.tsx
import React from 'react';
import { 
  Car, 
  Calendar, 
  Gauge, 
  Palette, 
  MapPin, 
  Eye, 
  Heart, 
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface CarCardProps {
  car: {
    publicKey: string;
    carId: string;
    vin: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    owner: string;
    ownerName: string;
    mileage: number;
    salePrice: number;
    inspectionStatus: 'valid' | 'pending' | 'expired';
   
    location: string;
    createdAt: string;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
  onBuyRequest: () => void;
  currentUserPublicKey?: string;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onBuyRequest,
  currentUserPublicKey,
}) => {
  const isOwner = currentUserPublicKey === car.owner;
  const priceInSOL = car.salePrice / LAMPORTS_PER_SOL;

  const getInspectionStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInspectionIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'expired': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="card bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {/* <img
          src={car.images[0] || `/api/placeholder/400/200`}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        /> */}
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={onToggleFavorite}
            className={`btn btn-circle btn-sm ${
              isFavorite ? 'btn-error text-white' : 'btn-ghost bg-gray-900/80 hover:bg-gray-900'
            } backdrop-blur-sm`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 left-4">
          <div className="badge badge-primary badge-lg font-bold text-white">
            {priceInSOL.toFixed(2)} SOL
          </div>
        </div>

        {/* Inspection Status */}
        {/* <div className="absolute bottom-4 left-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getInspectionStatusColor(car.inspectionStatus)}`}>
            {getInspectionIcon(car.inspectionStatus)}
            <span className="capitalize">{car.inspectionStatus}</span>
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className="card-body p-6">
        {/* Title */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="card-title text-lg font-bold text-gray-100">
            {car.brand} {car.model}
          </h3>
          <span className="text-sm text-gray-400">#{car.carId}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Gauge className="w-4 h-4 mr-2 text-indigo-400" />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Palette className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="capitalize">{car.color}</span>
          </div>
        </div>

        

        {/* Actions */}
        <div className="card-actions justify-between">
          <button
            onClick={onViewDetails}
            className="btn btn-ghost btn-sm flex-1 mr-2 text-gray-300 hover:text-gray-100"
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </button>
          
          {!isOwner && (
            <button
              onClick={onBuyRequest}
              className="btn btn-primary btn-sm flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy Request
            </button>
          )}
          
          {isOwner && (
            <div className="badge badge-info">Your Car</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
