// src/components/car/car-data-access.tsx
'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, SystemProgram,LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAnchorProvider } from '../solana/solana-provider';
import { useCarChainProgram } from '../hooks/use-car-chain';
import toast from 'react-hot-toast';
import { BN } from '@coral-xyz/anchor';
import { useGetCurrentUser } from '../users/user-data-access';

// Types
export interface CarAccount {
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNumber: string;
  owner: PublicKey;
  lastInspectionDate: number | null;
  inspectionStatus: CarInspectionStatus;
  latestInspectionReport: string | null;
  mileage: number | null;
  isForSale: boolean;
  salePrice: number | null;
  bump: number;
  publicKey: string;
}

export type CarInspectionStatus = 'pending' | 'passed' | 'failed';

export interface CarRegistrationData {
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNumber: string;
  lastInspectionDate: number | null;
  latestInspectionReport: string;
  mileage: number;
}

export interface CarTransferData {
  vin: string;
  newOwnerUsername: string;
}

export interface InspectionReportData {
  vin: string;
  reportUri: string;
  status: CarInspectionStatus;
  inspectorNotes?: string;
}

export interface BuyRequestData {
  vin: string;
  offerPrice: number;
  message?: string;
}

// Utility functions
function getCarPda(program: any, vin: string): [PublicKey, number] {
  const govPubKey=new PublicKey("FPZyc6E2jqfjdWJe7j1Rn4Ac4FC12CR5uRsisMaEKoT2");
  return PublicKey.findProgramAddressSync(
    [Buffer.from('car'),govPubKey.toBuffer(), Buffer.from(vin)],
    program.programId
  );
}

function getUserPda(program: any, authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), authority.toBuffer()],
    program.programId
  );
}


export function useGetUserCars(userPublicKey?: string) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['user-cars', userPublicKey],
    queryFn: async (): Promise<CarAccount[]> => {
      if (!program || !userPublicKey) {
        throw new Error('Program not initialized or user not connected');
      }

      try {
        const ownerPubkey = new PublicKey(userPublicKey);
        
        // Get all car accounts where owner matches the user
        const cars = await program.account.carAccount.all();
        const filteredCars = cars.filter(car => 
          car.account.owner.toString() === ownerPubkey.toString()
        );
        console.log(cars)
        return filteredCars.map((car) => ({
          ...car.account,
          publicKey: car.publicKey.toString(),
          carId: car.account.carId,
          vin: car.account.vin,
          brand: car.account.brand,
          model: car.account.model,
          year: car.account.year,
          color: car.account.color,
          engineNumber: car.account.engineNumber,
          owner: car.account.owner,
          lastInspectionDate: car.account.lastInspectionDate,
          inspectionStatus: Object.keys(car.account.inspectionStatus)[0] as CarInspectionStatus,
          latestInspectionReport: car.account.latestInspectionReport,
          mileage: car.account.mileage,
          isForSale: car.account.isForSale,
          salePrice: car.account.salePrice,
          bump: car.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching user cars:', error);
        throw new Error('Failed to fetch user cars');
      }
    },
    enabled: !!program && !!userPublicKey,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Search for a specific car by ID or VIN
 */
// export function useSearchCarById(carId: string) {
//   const { program } = useCarChainProgram();

//   return useQuery({
//     queryKey: ['car-search', carId],
//     queryFn: async (): Promise<CarAccount | null> => {
//       if (!program || !carId.trim()) {
//         return null;
//       }

//       try {
//         // First try to find by VIN (most common case)
//         const [carPda] = getCarPda(program, carId);
        
//         try {
//           const carAccount = await program.account.carAccount.fetch(carPda);
//           return {
//             ...carAccount,
//             publicKey: carPda.toString(),
//             inspectionStatus: Object.keys(carAccount.inspectionStatus)[0] as CarInspectionStatus,
//           };
//         } catch (error) {
//           // If not found by VIN, search through all cars by carId
//           const cars = await program.account.carAccount.all([
//             {
//               memcmp: {
//                 offset: 8, // Offset to carId field
//                 bytes: carId,
//               },
//             },
//           ]);

//           if (cars.length > 0) {
//             const car = cars[0];
//             return {
//               ...car.account,
//               publicKey: car.publicKey.toString(),
//               inspectionStatus: Object.keys(car.account.inspectionStatus)[0] as CarInspectionStatus,
//             };
//           }

//           return null;
//         }
//       } catch (error) {
//         console.error('Error searching car:', error);
//         return null;
//       }
//     },
//     enabled: !!program && !!carId.trim(),
//     staleTime: 10000, // 10 seconds
//   });
// }

/**
 * Get all cars currently for sale
 */
export function useCarsForSale() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['cars-for-sale'],
    queryFn: async (): Promise<CarAccount[]> => {
      if (!program) {
        throw new Error('Program not initialized');
      }

      try {
        // Get all car accounts where isForSale is true
        const cars = await program.account.carAccount.all([
          {
            memcmp: {
              offset: 8 + 32 + 32 + 32 + 32 + 4 + 32 + 32 + 32 + 8 + 1 + 32 + 8 + 1, // Offset to isForSale field
              bytes: 'true', // This might need adjustment based on how boolean is stored
            },
          },
        ]);

        return cars
          .filter((car) => car.account.isForSale)
          .map((car) => ({
            ...car.account,
            publicKey: car.publicKey.toString(),
            inspectionStatus: Object.keys(car.account.inspectionStatus)[0] as CarInspectionStatus,
          }));
      } catch (error) {
        console.error('Error fetching cars for sale:', error);
        throw new Error('Failed to fetch cars for sale');
      }
    },
    enabled: !!program,
    staleTime: 15000, // 15 seconds
  });
}

/**
 * Toggle car for sale status
 */
export function useToggleCarForSale() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vin, forSale, price }: { vin: string; forSale: boolean,price: number }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      try {
        // Find car by VIN first, then by carId
        let carPda: PublicKey;
        let carBump: number;
        try {
          [carPda,carBump] = getCarPda(program, vin);
          await program.account.carAccount.fetch(carPda);
        } catch(err) {
          // Search by carId if VIN doesn't work
          console.error(err)
        }
       
        if(forSale){
          const priceInLamports = new BN(price * 1e9);
          const tx = await program.methods
          .setForSale(vin, priceInLamports)
          .accounts({
            carAccount: carPda,
            owner: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
          return tx;
        }
        else {
          const tx = await program.methods
          .cancelForSale(vin)
          .accounts({
            carAccount: carPda,
            owner: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
          return tx;
        }
       
      } catch (error) {
        console.error('Error toggling car for sale:', error);
        throw new Error('Failed to update car sale status');
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
      queryClient.invalidateQueries({ queryKey: ['car-search'] });
    },
  });
}

/**
 * Update car sale price
 */
// export function useUpdateCarPrice() {
//   const { program } = useCarChainProgram();
//   const { publicKey } = useWallet();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ carId, price }: { carId: string; price: number }) => {
//       if (!program || !publicKey) {
//         throw new Error('Program not initialized or wallet not connected');
//       }

//       try {
//         // Find car PDA
//         let carPda: PublicKey;
        
//         try {
//           [carPda] = getCarPda(program, carId);
//           await program.account.carAccount.fetch(carPda);
//         } catch {
//           const cars = await program.account.carAccount.all([
//             {
//               memcmp: {
//                 offset: 8,
//                 bytes: carId,
//               },
//             },
//           ]);
          
//           if (cars.length === 0) {
//             throw new Error('Car not found');
//           }
          
//           carPda = cars[0].publicKey;
//         }

//         const priceInLamports = new BN(price * 1e9); // Convert SOL to lamports

//         const tx = await program.methods
//           .updateCarPrice(priceInLamports)
//           .accounts({
//             car: carPda,
//             owner: publicKey,
//             systemProgram: SystemProgram.programId,
//           })
//           .rpc();

//         return tx;
//       } catch (error) {
//         console.error('Error updating car price:', error);
//         throw new Error('Failed to update car price');
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['user-cars'] });
//       queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
//       queryClient.invalidateQueries({ queryKey: ['car-search'] });
//     },
//   });
// }

/**
 * Transfer car ownership
 */
export function useTransferCar() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vin, newOwnerUsername }: CarTransferData) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      try {
        const [carPda] = getCarPda(program, vin);

        // Find new owner by username
        const users = await program.account.userAccount.all();
        const newOwnerUser = users.find(user => user.account.userName === newOwnerUsername);
        
        if (!newOwnerUser) {
          throw new Error('New owner not found');
        }

        const newOwner = newOwnerUser.account.authority;
        const [newOwnerPda] = getUserPda(program, newOwner);

        const tx = await program.methods
          .transferCar(vin, newOwnerUsername)
          .accounts({
            car: carPda,
            currentOwner: publicKey,
            newOwner: newOwner,
            newOwnerPda: newOwnerPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (error) {
        console.error('Error transferring car:', error);
        throw new Error('Failed to transfer car ownership');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
    },
  });
}

/**
 * Add inspection report (Inspector only)
 */
export function useAddInspectionReport() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vin, reportUri, status, inspectorNotes }: InspectionReportData) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      try {
        const [carPda] = getCarPda(program, vin);
        const [inspectorPda] = getUserPda(program, publicKey);

        // Convert status to the format expected by the program
        const inspectionStatus = { [status]: {} };

        const tx = await program.methods
          .addInspectionReport(vin, reportUri, inspectionStatus, inspectorNotes || '')
          .accounts({
            car: carPda,
            inspector: publicKey,
            inspectorPda: inspectorPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (error) {
        console.error('Error adding inspection report:', error);
        throw new Error('Failed to add inspection report');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['car-search'] });
      queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
    },
  });
}

/**
 * Make buy request for a car
 */
export function useMakeBuyRequest() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vin, offerPrice, message }: BuyRequestData) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      try {
        const [carPda] = getCarPda(program, vin);
        const [buyerPda] = getUserPda(program, publicKey);
        
        const priceInLamports = new BN(offerPrice * 1e9); // Convert SOL to lamports

        const tx = await program.methods
          .makeBuyRequest(vin, priceInLamports, message || '')
          .accounts({
            car: carPda,
            buyer: publicKey,
            buyerPda: buyerPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (error) {
        console.error('Error making buy request:', error);
        throw new Error('Failed to make buy request');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
      queryClient.invalidateQueries({ queryKey: ['car-search'] });
    },
  });
}

/**
 * Get car history/transactions
 */
export function useCarHistory(carId: string) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['car-history', carId],
    queryFn: async () => {
      if (!carId) {
        return [];
      }

      try {
        // This would typically fetch transaction history from the blockchain
        // For now, return empty array as this requires more complex implementation
        const signatures = await connection.getSignaturesForAddress(
          new PublicKey(carId),
          { limit: 50 }
        );

        return signatures;
      } catch (error) {
        console.error('Error fetching car history:', error);
        return [];
      }
    },
    enabled: !!carId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get car statistics for dashboard
 */
export function useCarStatistics(userPublicKey?: string) {
  const userCarsQuery = useGetUserCars(userPublicKey);
  const carsForSaleQuery = useCarsForSale();

  return useQuery({
    queryKey: ['car-statistics', userPublicKey],
    queryFn: () => {
      const userCars = userCarsQuery.data || [];
      const allCarsForSale = carsForSaleQuery.data || [];

      return {
        totalCars: userCars.length,
        carsForSale: userCars.filter(car => car.isForSale).length,
        totalMarketCars: allCarsForSale.length,
        averagePrice: allCarsForSale.length > 0 
          ? allCarsForSale.reduce((sum, car) => sum + (car.salePrice || 0), 0) / allCarsForSale.length
          : 0,
        inspectionStats: {
          passed: userCars.filter(car => car.inspectionStatus === 'passed').length,
          pending: userCars.filter(car => car.inspectionStatus === 'pending').length,
          failed: userCars.filter(car => car.inspectionStatus === 'failed').length,
        }
      };
    },
    enabled: !!userCarsQuery.data && !!carsForSaleQuery.data,
  });
}


/**
 * Get buy requests for a car
 */
export function useGetCarBuyRequests(vin: string) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['car-buy-requests', vin],
    queryFn: async () => {
      if (!program || !vin) {
        throw new Error('Program not initialized or VIN not provided');
      }

      try {
        const [carPda,bump] = getCarPda(program, vin);
        const allBuyRequests = await program.account.buyRequest.all();
        const buyRequests = allBuyRequests.filter(request => 
          request.account.car.toString() === carPda.toString()
        );
        console.log("buyRequests",buyRequests)
        console.log("all buyRequests",allBuyRequests)
        console.log("all buyRequests",allBuyRequests[0].account.car.toString())
        console.log("all buyRequests",carPda.toString())
        console.log("all buyRequests",allBuyRequests[0].account.car.toString() === carPda.toString())

        return buyRequests.map(request => ({
          buyer: request.account.buyer,
          offerPrice: request.account.offerPrice.toNumber() / LAMPORTS_PER_SOL,
          message: request.account.message,
          timestamp: request.account.timestamp.toNumber(),
          status: Object.keys(request.account.status)[0],
          publicKey: request.publicKey.toString()
        }));
      } catch (error) {
        console.error('Error fetching buy requests:', error);
        throw new Error('Failed to fetch buy requests');
      }
    },
    enabled: !!program && !!vin,
    staleTime: 15000, // 15 seconds
  });
}
export function useGetBuyRequests() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['car-buy-requests'],
    queryFn: async () => {
      if (!program ) {
        throw new Error('Program not initialized or VIN not provided');
      }

      try {
        const allBuyRequests = await program.account.buyRequest.all();
        console.log("all all",allBuyRequests);
      
        return allBuyRequests.map(request => ({
          carVin: request.account.vin,
          buyer: request.account.buyer,
          offerPrice: request.account.amount.toNumber() / LAMPORTS_PER_SOL,
          message: request.account.message,
          timestamp: request.account.createdAt.toNumber(),
          status: Object.keys(request.account.status)[0],
          publicKey: request.publicKey.toString()
        }));
      } catch (error) {
        console.error('Error fetching buy requests:', error);
        throw new Error('Failed to fetch buy requests');
      }
    },
    enabled: !!program ,
    staleTime: 15000, // 15 seconds
  });
}
/**
 * Respond to a buy request (accept/reject)
 */
export function useRespondToBuyRequest() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const ownerPda = useGetCurrentUser().data?.userPda;
  return useMutation({
    mutationFn: async ({ 
      vin,
      buyRequestPubkey,
      accept 
    }: { 
      vin: string;
      buyRequestPubkey: string; 
      accept: string;
    }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      try {
        const [carPda] = getCarPda(program, vin);
        console.log("carPda",carPda)
        console.log("buyRequestPubkey",buyRequestPubkey)
        console.log("accept",accept)
        console.log("publicKey",publicKey)
        // Validate buyRequestPubkey is a valid public key string
        if (!buyRequestPubkey || typeof buyRequestPubkey !== 'string') {
          throw new Error('Invalid buy request public key');
        }
        
        const buyRequestPda = new PublicKey(buyRequestPubkey);
       

        // Get buy request account to get buyer info
        const buyRequest = await program.account.buyRequest.fetch(buyRequestPda);
        if (!buyRequest) {
          throw new Error('Buy request not found');
        }

        const buyer = buyRequest.buyer;
        
        
        const userAccounts = await program.account.userAccount.all();
        const buyerPda = userAccounts.find(
          account => account.account.authority.equals(buyer)
        )?.publicKey;

        const tx = await program.methods
          .acceptBuyRequest(vin, buyer)
          .accounts({
            buyRequest: buyRequestPda,
            car: carPda,
            ownerPda: ownerPda,
            buyerPda: buyerPda,
            owner: publicKey,
            buyerAccount: buyer,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (error) {
        console.error('Error responding to buy request:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-buy-requests', variables.vin] });
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars-for-sale'] });
      toast.success(`Successfully ${variables.accept ? 'accepted' : 'rejected'} buy request`);
    },
    onError: (error) => {
      toast.error(`Failed to respond to buy request: ${error.message}`);
    }
  });
}
