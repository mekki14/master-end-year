'use client'
// pages/marketplace/index.tsx
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Car className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Car Marketplace</h1>
            <p className="text-xl text-gray-300 mb-8">Connect your wallet to browse and buy cars</p>
            <WalletMultiButton className="btn btn-primary btn-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Car className="w-8 h-8 text-indigo-400 mr-3" />
                Car Marketplace
              </h1>
              <p className="text-gray-400 mt-1">Discover and buy verified vehicles</p>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cars..."
                className="input input-bordered w-full pl-10 bg-gray-700 text-white border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Brand Filter */}
            <select
              className="select select-bordered bg-gray-700 text-white border-gray-600"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="select select-bordered bg-gray-700 text-white border-gray-600"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest</option>
              <option value="year-old">Year: Oldest</option>
              <option value="mileage">Lowest Mileage</option>
            </select>

            {/* Filters Button */}
            <button className="btn btn-outline text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-300">
            Showing {filteredCars.length} of {cars.filter(c => c.isForSale).length} cars for sale
          </p>
          <div className="flex space-x-2">
            <button className="btn btn-sm btn-ghost text-gray-300 hover:text-white">
              <Heart className="w-4 h-4 mr-1" />
              My Favorites ({favorites.length})
            </button>
            <div>
              <button 
                className="btn btn-sm btn-ghost text-gray-300 hover:text-white"
                onClick={() => (document.getElementById('my_requests_drawer') as HTMLDialogElement).showModal()}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                My Requests ({myBuyRequests.length})
              </button>
              <dialog id="my_requests_drawer" className="modal">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">My Buy Requests</h3>
                  <div className="py-4">
                    {myBuyRequests.map((request) => (
                      <div key={request.publicKey} className="mb-4 p-4 bg-base-200 rounded-lg">
                        <h4 className="font-medium">{request.buyerName}</h4>
                        <p className="text-sm opacity-70">{request.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge ${
                            request.status === 'pending' ? 'badge-warning' :
                            request.status === 'accepted' ? 'badge-success' :
                            'badge-error'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="container mx-auto px-4 pb-12">
        {carsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-gray-800 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-700 rounded-t-lg"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No cars found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map(car => (
              <CarCard
                key={car.publicKey}
                car={car}
                isFavorite={favorites.includes(car.publicKey)}
                onToggleFavorite={() => toggleFavorite(car.publicKey)}
                onViewDetails={() => setSelectedCar(car)}
                onBuyRequest={() => handleBuyRequest(car)}
                currentUserPublicKey={publicKey?.toString()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
    </div>
  );
};

export default Marketplace;
