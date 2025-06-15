'use client'
// pages/marketplace/index.tsx
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Gauge,
  Palette,
  Settings,
  MapPin,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { LAMPORTS_PER_SOL,PublicKey,SystemProgram } from '@solana/web3.js';
import CarCard from './car-card';
import CarDetailsModal from './car-details-modal';
import BuyRequestModal from './buy-request-modal';
import { useMarketplaceData } from '../hooks/use-marketplace-data';
import { useUserData } from '../hooks/use-user-data';
import { useCarChainProgram, useGetCurrentUser } from '../users/user-data-access';
import toast from 'react-hot-toast';

interface MarketplaceCar {
  publicKey: string;
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNumber: string;
  owner: string;
  mileage: number;
  salePrice: number;
  isForSale: boolean;
  lastInspectionDate: string | null;
  inspectionStatus: 'valid' | 'pending' | 'expired';
  createdAt: string;
}

interface BuyRequest {
  publicKey: string;
  car: string;
  buyer: string;
  buyerName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  price: number;
}

const Marketplace = () => {
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [yearRange, setYearRange] = useState({ min: 2010, max: 2025 });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCar, setSelectedCar] = useState<MarketplaceCar | null>(null);
  const [showBuyRequestModal, setShowBuyRequestModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hooks
  const { program } = useCarChainProgram();
  const {data:currentUser} = useGetCurrentUser();
  const { data: cars = [], isLoading: carsLoading } = useMarketplaceData();
  const { data: myBuyRequests = [] } = useQuery({
    queryKey: ['my-buy-requests', publicKey?.toString()],
    queryFn: () => fetchMyBuyRequests(),
    enabled: !!publicKey,
  });

  // PDA derivation functions
  const getBuyRequestPDA = async (carVin: string, buyer: PublicKey): Promise<[PublicKey, number]> => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("buy_request"),
        Buffer.from(carVin),
        buyer.toBuffer()
      ],
      program.programId
    );
  };
  
  const GOVERNMENT_AUTHORITY = new PublicKey("FPZyc6E2jqfjdWJe7j1Rn4Ac4FC12CR5uRsisMaEKoT2");

  // Mock data fetch functions (replace with actual program calls)
  const fetchMyBuyRequests = async (): Promise<BuyRequest[]> => {
    if (!publicKey || !program) return [];

    try {
      // Get all buy requests where the current user is the buyer
      const buyRequests = await program.account.buyRequest.all();
      console.log("buyRequests",buyRequests)
      const filteredRequests = buyRequests.filter(request => 
        request.account.buyer.toString() === publicKey.toString()
      );
      console.log("filteredRequests buyRequests",buyRequests[0].account.buyer.toString())
      console.log("filteredRequests buyRequests2",publicKey.toString())
      console.log("filteredRequests buyRequests2",filteredRequests)

      return filteredRequests.map(request => ({
        publicKey: request.publicKey.toString(),
        car: request.account.vin,
        buyer: request.account.buyer.toString(),
        buyerName: currentUser?.userPda?.userName || '',
        message: request.account.message || '',
        status: request.account.status.pending ? 'pending' : request.account.status.accepted ? 'accepted' : 'rejected',
        createdAt: new Date(request.account.createdAt * 1000).toISOString(),
        price: request.account.amount,
      }));
    } catch (error) {
      console.error('Error fetching buy requests:', error);
      return [];
    }
  };

  // Mutations
  const createBuyRequestMutation = useMutation({
    mutationFn: async ({ carVin, message }: { carVin: string; message: string }) => {
      try {
        const [carPda, bump] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("car", "utf8"),
            GOVERNMENT_AUTHORITY.toBuffer(),
            Buffer.from(carVin, "utf8")
          ],
          program.programId
        );
        
        // Send transaction to create buy request on Solana
        const transaction = await program.methods
          .requestBuy(carVin, message || "")
          .accounts({
            buyRequest: (await getBuyRequestPDA(carVin, publicKey!))[0],
            car: carPda,
            buyerPda: currentUser?.userPda,
            buyer: publicKey!,
            systemProgram: SystemProgram.programId,
          }).rpc();

        return { success: true, transaction };
      } catch (error) {
        console.error('Error creating buy request:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create buy request');
      }
    },
    onSuccess: (data) => {
      toast.success('Buy request created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-buy-requests'] });
      setShowBuyRequestModal(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create buy request');
    }
  });

  const setCarForSaleMutation = useMutation({
    mutationFn: async ({ carVin, price }: { carVin: string; price: number }) => {
      console.log('Setting car for sale:', carVin, price);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cars'] });
    },
  });

  // Filter and sort cars
  const filteredCars = cars
    .filter(car => {
      const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.vin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === 'all' || car.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesPrice = car.salePrice >= priceRange.min * LAMPORTS_PER_SOL && 
                          car.salePrice <= priceRange.max * LAMPORTS_PER_SOL;
      const matchesYear = car.year >= yearRange.min && car.year <= yearRange.max;
      console.log("matches",car.year)
      console.log("matches",yearRange.min)
      console.log("matches",yearRange.max)
      return matchesSearch && matchesBrand && matchesPrice && matchesYear;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.salePrice - b.salePrice;
        case 'price-high': return b.salePrice - a.salePrice;
        case 'year-new': return b.year - a.year;
        case 'year-old': return a.year - b.year;
        case 'mileage': return a.mileage - b.mileage;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    console.log("cars",filteredCars)

  // Get unique brands for filter
  const brands = Array.from(new Set(cars.map(car => car.brand)));

  const handleBuyRequest = (car: MarketplaceCar) => {
    setSelectedCar(car);
    setShowBuyRequestModal(true);
  };

  const toggleFavorite = (carId: string) => {
    setFavorites(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mb-8"
            >
              <Car className="w-20 h-20 text-purple-400 mx-auto" />
            </motion.div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Car Marketplace
            </h1>
            <p className="text-xl text-purple-200/80 mb-12 max-w-2xl mx-auto">
              Connect your wallet to browse and buy verified vehicles on the blockchain
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 !text-white !px-8 !py-4 !text-lg !font-semibold !rounded-2xl !shadow-lg !hover:shadow-purple-500/25 !transition-all !duration-200" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 text-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border-b border-purple-500/20 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-4"
                >
                  <Car className="w-10 h-10 text-purple-400" />
                </motion.div>
                Car Marketplace
              </h1>
              <p className="text-purple-200/70 mt-2 text-lg">Discover and buy verified vehicles</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 !text-white !px-6 !py-3 !font-semibold !rounded-2xl !shadow-lg !hover:shadow-purple-500/25 !transition-all !duration-200" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 shadow-lg border-b border-purple-500/10 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cars..."
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-12 py-4 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </motion.div>

            {/* Brand Filter */}
            <motion.select
              whileFocus={{ scale: 1.02 }}
              className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-4 text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </motion.select>

            {/* Sort */}
            <motion.select
              whileFocus={{ scale: 1.02 }}
              className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-4 text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest</option>
              <option value="year-old">Year: Oldest</option>
              <option value="mileage">Lowest Mileage</option>
            </motion.select>

            {/* Filters Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-2xl px-6 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Filter className="w-5 h-5" />
              More Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 py-6"
      >
        <div className="flex justify-between items-center">
          <motion.p 
            className="text-purple-200/80 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Showing <span className="font-semibold text-purple-300">{filteredCars.length}</span> of{' '}
            <span className="font-semibold text-purple-300">{cars.filter(c => c.isForSale).length}</span> cars for sale
          </motion.p>
          <div className="flex space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
            >
              <Heart className="w-4 h-4" />
              My Favorites ({favorites.length})
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50"
              onClick={() => (document.getElementById('my_requests_drawer') as HTMLDialogElement).showModal()}
            >
              <MessageSquare className="w-4 h-4" />
              My Requests ({myBuyRequests.length})
            </motion.button>
            
            {/* Enhanced Buy Requests Modal */}
            <dialog id="my_requests_drawer" className="modal backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="modal-box bg-gradient-to-r from-slate-900 to-purple-900/80 border border-purple-500/30 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                  <h3 className="font-bold text-2xl text-white">My Buy Requests</h3>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myBuyRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                      <p className="text-purple-200/60">No buy requests yet</p>
                    </div>
                  ) : (
                    myBuyRequests.map((request, index) => (
                      <motion.div 
                        key={request.publicKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 rounded-2xl p-4 border border-purple-500/20"
                      >
                        <h4 className="font-semibold text-white mb-2">{request.buyerName}</h4>
                        <p className="text-sm text-purple-200/70 mb-3">{request.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                              request.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              request.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {request.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                              {request.status === 'accepted' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                              {request.status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-purple-300/50">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                <div className="modal-action mt-6">
                  <form method="dialog">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                    >
                      Close
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </dialog>
          </div>
        </div>
      </motion.div>

      {/* Cars Grid */}
      <div className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {carsLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-r from-slate-700/50 to-purple-800/30 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-700/50 rounded-xl animate-pulse"></div>
                    <div className="h-6 bg-slate-700/50 rounded-xl animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 bg-slate-700/50 rounded-xl animate-pulse"></div>
                      <div className="h-3 bg-slate-700/50 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-slate-700/50 rounded-2xl animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : filteredCars.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity 
                }}
              >
                <Car className="w-20 h-20 text-purple-500/50 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-purple-200 mb-4">No cars found</h3>
              <p className="text-purple-300/60 text-lg">Try adjusting your search or filters to find more vehicles</p>
            </motion.div>
          ) : (
            <motion.div 
              key="cars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCars.map((car, index) => (
                <motion.div
                  key={car.publicKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CarCard
                    car={car}
                    isFavorite={favorites.includes(car.publicKey)}
                    onToggleFavorite={() => toggleFavorite(car.publicKey)}
                    onViewDetails={() => setSelectedCar(car)}
                    onBuyRequest={() => handleBuyRequest(car)}
                    currentUserPublicKey={publicKey?.toString()}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCar && !showBuyRequestModal && (
          <CarDetailsModal
            car={selectedCar}
            isOpen={!!selectedCar}
            onClose={() => setSelectedCar(null)}
            onBuyRequest={() => handleBuyRequest(selectedCar)}
            currentUserPublicKey={publicKey?.toString()}
          />
        )}

        {showBuyRequestModal && selectedCar && (
          <BuyRequestModal
            car={selectedCar}
            isOpen={showBuyRequestModal}
            onClose={() => setShowBuyRequestModal(false)}
            onSubmit={(message) => createBuyRequestMutation.mutate({
              carVin: selectedCar.vin,
              message
            })}
            isLoading={createBuyRequestMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
