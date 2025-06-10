// hooks/useMarketplaceData.ts
import { useQuery } from '@tanstack/react-query';
import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useCarChainProgram } from './use-car-chain';
export function useMarketplaceData() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['marketplace-cars', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return [];

      try {
        const allCars = await program.account.carAccount.all();
        
        const marketplaceCars = allCars.filter(car => 
          car.account.isForSale === true
        );
        console.log("marketplaceCars",marketplaceCars)

        return marketplaceCars.map(car => ({
          publicKey: car.publicKey.toString(),
          carId: car.account.carId,
          vin: car.account.vin,
          brand: car.account.brand,
          model: car.account.model,
          year: car.account.year,
          color: car.account.color,
          engineNumber: car.account.engineNumber,
          owner: car.account.owner.toString(),
          registeredBy: car.account.registeredBy.toString(),
          registrationDate: car.account.registrationDate?.toNumber(),
          isActive: car.account.isActive,
          transferCount: car.account.transferCount,
          lastInspectionDate: car.account.last_inspection_date?.toNumber(),
          inspectionStatus: car.account.inspectionStatus,
          latestInspectionReport: car.account.latestInspectionReport,
          mileage: car.account.mileage,
          isForSale: car.account.isForSale,
          salePrice: car.account.salePrice?.toNumber(),
          bump: car.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching marketplace cars:', error);
        return [];
      }
    },
    enabled: !!program && !!publicKey,
  });
}
