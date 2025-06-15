// components/CarCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle,
  Crown,
  Sparkles,
  ArrowRight
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

  const getInspectionStatusConfig = (status: string) => {
    switch (status) {
      case 'valid': 
        return {
          color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
          icon: <CheckCircle className="w-3 h-3" />,
          glow: 'shadow-emerald-500/20'
        };
      case 'pending': 
        return {
          color: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
          icon: <Clock className="w-3 h-3" />,
          glow: 'shadow-amber-500/20'
        };
      case 'expired': 
        return {
          color: 'text-red-300 bg-red-500/20 border-red-500/30',
          icon: <AlertCircle className="w-3 h-3" />,
          glow: 'shadow-red-500/20'
        };
      default: 
        return {
          color: 'text-slate-300 bg-slate-500/20 border-slate-500/30',
          icon: <AlertCircle className="w-3 h-3" />,
          glow: 'shadow-slate-500/20'
        };
    }
  };

  const inspectionConfig = getInspectionStatusConfig(car.inspectionStatus);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl shadow-xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden"
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-700 to-purple-900/50">
        {/* Placeholder Car Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-purple-400/30"
          >
            <Car className="w-20 h-20" />
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              x: [0, 10, -10, 0],
              y: [0, -5, 5, 0],
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-6 left-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400/40" />
          </motion.div>
          <motion.div
            animate={{ 
              x: [0, -8, 8, 0],
              y: [0, 8, -8, 0],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-6 right-6"
          >
            <Sparkles className="w-3 h-3 text-purple-400/30" />
          </motion.div>
        </div>

        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFavorite}
            className={`w-10 h-10 rounded-2xl backdrop-blur-sm border transition-all duration-200 flex items-center justify-center ${
              isFavorite 
                ? 'bg-rose-500/80 border-rose-400/50 text-white shadow-lg shadow-rose-500/25' 
                : 'bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 left-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 border border-purple-400/30"
          >
            {priceInSOL.toFixed(2)} SOL
          </motion.div>
        </div>

        {/* Inspection Status */}
        {/* <div className="absolute bottom-4 left-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border backdrop-blur-sm ${inspectionConfig.color} ${inspectionConfig.glow}`}
          >
            {inspectionConfig.icon}
            <span className="capitalize">{car.inspectionStatus}</span>
          </motion.div>
        </div> */}
      </div>

      {/* Content Section */}
      <div className="relative p-6 space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start">
          <motion.h3 
            className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-200"
            whileHover={{ x: 5 }}
          >
            {car.brand} {car.model}
          </motion.h3>
          <span className="text-sm text-purple-300/60 font-mono bg-purple-500/10 px-2 py-1 rounded-lg">
            #{car.carId}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="flex items-center text-sm text-purple-200/80 bg-slate-800/30 rounded-xl p-3 border border-purple-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-medium">{car.year}</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center text-sm text-purple-200/80 bg-slate-800/30 rounded-xl p-3 border border-purple-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <Gauge className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-medium">{car.mileage.toLocaleString()} km</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center text-sm text-purple-200/80 bg-slate-800/30 rounded-xl p-3 border border-purple-500/20 col-span-2"
            whileHover={{ scale: 1.02 }}
          >
            <Palette className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-medium capitalize">{car.color}</span>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetails}
            className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 group/btn"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transform translate-x-[-10px] group-hover/btn:translate-x-0 transition-all duration-200" />
          </motion.button>
          
          {!isOwner ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBuyRequest}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl px-4 py-3 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Request</span>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/30 text-amber-300 rounded-2xl px-4 py-3 font-semibold flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Your Car</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default CarCard;
