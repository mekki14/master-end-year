// src/components/government/government-data-access.tsx
'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useAnchorProvider } from '../solana/solana-provider';
import { useCarChainProgram } from '../hooks/use-car-chain';
import toast from 'react-hot-toast';
import { BN, utils } from '@coral-xyz/anchor';

// Types
export interface GovernmentProfile {
  publicKey: string;
  userName: string;
  role: {
    government?: {};
    inspector?: {};
    regularUser?: {};
  };
  isVerified: boolean;
  createdAt: number;
}

export interface PlatformStatistics {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  activeInspectors: number;
  totalCars: number;
  totalTransactions: number;
  dailyActiveUsers: number;
  monthlyTransactions: number;
  totalRevenue: number;
}

export interface PendingUser {
  publicKey: string;
  userName: string;
  role: any;
  isVerified: boolean;
  createdAt: number;
  documentUri?: string;
  rejectionReason?: string;
}

export interface CarStatistics {
  totalCars: number;
  carsForSale: number;
  recentlyRegistered: number;
  inspectionStats: {
    passed: number;
    failed: number;
    pending: number;
  };
  brandDistribution: { [key: string]: number };
  averageAge: number;
}

// Government Profile Hook
export function useGetGovernmentProfile(governmentPublicKey?: string) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['government-profile', governmentPublicKey],
    queryFn: async (): Promise<GovernmentProfile | null> => {
      if (!program || !governmentPublicKey) {
        return null;
      }

      try {
        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), new PublicKey(governmentPublicKey).toBuffer()],
          program.programId
        );

        const userAccount = await program.account.userAccount.fetch(userPda);
        
        return {
          publicKey: governmentPublicKey,
          userName: userAccount.userName,
          role: userAccount.role,
          isVerified: userAccount.isVerified,
          createdAt: userAccount.createdAt.toNumber(),
        };
      } catch (error) {
        console.error('Error fetching government profile:', error);
        return null;
      }
    },
    enabled: !!program && !!governmentPublicKey,
    retry: 2,
    staleTime: 60000,
  });
}

// Get All Users Hook
export function useGetAllUsers() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['all-users'],
    queryFn: async (): Promise<PendingUser[]> => {
      if (!program) {
        return [];
      }

      try {
        const allUsers = await program.account.userAccount.all();
        return allUsers.map((user) => ({
          publicKey: user.publicKey.toString(),
          authority: user.account.authority.toString(),
          userName: user.account.userName,
          role: user.account.role,
          isVerified: user.account.verificationStatus?.verified || false,
          createdAt: user.account.createdAt.toNumber(),
          documentUri: user.account.documentUri,
          rejectionReason: user.account.rejectionReason,
        }));
      } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
      }
    },
    enabled: !!program,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

// Get Pending Users Hook
export function useGetPendingUsers() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['pending-users'],
    queryFn: async (): Promise<PendingUser[]> => {
      if (!program) {
        return [];
      }

      try {
        // Get all users and filter pending ones
        const allUsers = await program.account.userAccount.all();
        
        const pendingUsers = allUsers
          .filter(user => !user.account.verificationStatus?.verified)
          .map((user) => ({
            publicKey: user.publicKey.toString(),
            userName: user.account.userName,
            role: user.account.role,
            isVerified: !user.account.verificationStatus?.verified,
            createdAt: user.account.createdAt.toNumber(),
            documentUri: user.account.documentUri,
            rejectionReason: user.account.rejectionReason,
          }));

        return pendingUsers;
      } catch (error) {
        console.error('Error fetching pending users:', error);
        return [];
      }
    },
    enabled: !!program,
    refetchInterval: 15000, // More frequent refresh for pending users
    staleTime: 5000,
  });
}

// Platform Statistics Hook
export function useGetPlatformStatistics() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['platform-statistics'],
    queryFn: async (): Promise<PlatformStatistics> => {
      if (!program) {
        return {
          totalUsers: 0,
          verifiedUsers: 0,
          pendingUsers: 0,
          activeInspectors: 0,
          totalCars: 0,
          totalTransactions: 0,
          dailyActiveUsers: 0,
          monthlyTransactions: 0,
          totalRevenue: 0,
        };
      }

      try {
        // Fetch all users
        const allUsers = await program.account.userAccount.all();
        const allCars = await program.account.carAccount.all();
        
        // Calculate user statistics
        const totalUsers = allUsers.length;
        const verifiedUsers = allUsers.filter(user => user.account.isVerified).length;
        const pendingUsers = allUsers.filter(user => !user.account.isVerified).length;
        const activeInspectors = allUsers.filter(user => 
          user.account.role?.inspector && user.account.isVerified
        ).length;

        // Calculate car statistics
        const totalCars = allCars.length;
        const carsForSale = allCars.filter(car => car.account.isForSale).length;

        // Mock some additional statistics (in a real app, you'd track these)
        const dailyActiveUsers = Math.floor(totalUsers * 0.3);
        const monthlyTransactions = Math.floor(totalCars * 2.5);
        const totalRevenue = carsForSale * 0.1; // Mock revenue

        return {
          totalUsers,
          verifiedUsers,
          pendingUsers,
          activeInspectors,
          totalCars,
          totalTransactions: monthlyTransactions,
          dailyActiveUsers,
          monthlyTransactions,
          totalRevenue,
        };
      } catch (error) {
        console.error('Error fetching platform statistics:', error);
        return {
          totalUsers: 0,
          verifiedUsers: 0,
          pendingUsers: 0,
          activeInspectors: 0,
          totalCars: 0,
          totalTransactions: 0,
          dailyActiveUsers: 0,
          monthlyTransactions: 0,
          totalRevenue: 0,
        };
      }
    },
    enabled: !!program,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

// Car Statistics Hook
export function useGetCarStatistics() {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['car-statistics'],
    queryFn: async (): Promise<CarStatistics> => {
      if (!program) {
        return {
          totalCars: 0,
          carsForSale: 0,
          recentlyRegistered: 0,
          inspectionStats: { passed: 0, failed: 0, pending: 0 },
          brandDistribution: {},
          averageAge: 0,
        };
      }

      try {
        const allCars = await program.account.carAccount.all();
        
        const totalCars = allCars.length;
        const carsForSale = allCars.filter(car => car.account.isForSale).length;
        
        // Calculate recent registrations (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentlyRegistered = allCars.filter(car => 
          car.account.createdAt && car.account.createdAt.toNumber() > thirtyDaysAgo
        ).length;

        // Calculate inspection statistics
        const inspectionStats = allCars.reduce(
          (stats, car) => {
            const status = Object.keys(car.account.inspectionStatus)[0];
            if (status === 'passed') stats.passed++;
            else if (status === 'failed') stats.failed++;
            else stats.pending++;
            return stats;
          },
          { passed: 0, failed: 0, pending: 0 }
        );

        // Calculate brand distribution
        const brandDistribution = allCars.reduce((brands: { [key: string]: number }, car) => {
          const brand = car.account.brand;
          brands[brand] = (brands[brand] || 0) + 1;
          return brands;
        }, {});

        // Calculate average car age
        const currentYear = new Date().getFullYear();
        const totalAge = allCars.reduce((sum, car) => sum + (currentYear - car.account.year), 0);
        const averageAge = totalCars > 0 ? Math.round(totalAge / totalCars) : 0;

        return {
          totalCars,
          carsForSale,
          recentlyRegistered,
          inspectionStats,
          brandDistribution,
          averageAge,
        };
      } catch (error) {
        console.error('Error fetching car statistics:', error);
        return {
          totalCars: 0,
          carsForSale: 0,
          recentlyRegistered: 0,
          inspectionStats: { passed: 0, failed: 0, pending: 0 },
          brandDistribution: {},
          averageAge: 0,
        };
      }
    },
    enabled: !!program,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// Verify User Mutation
export function useVerifyUser() {
  const { publicKey } = useWallet();
  const { program } = useCarChainProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['verify-user'],
    mutationFn: async ({ userPublicKey, username }: { userPublicKey: string, username: string }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      console.log(username)
      console.log(userPublicKey)
      const userPubkey = new PublicKey(userPublicKey);
      const [userPda,bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), 
          userPubkey.toBuffer(), 
          utils.bytes.utf8.encode(username)],
        program.programId
      );

      console.log("gov", publicKey)
      const tx = await program.methods
        .verifyUser(username, true)
        .accounts({
          userAccount: userPda,
          government: publicKey,
        })
        .rpc();


      return { signature: tx, userPublicKey };
    },
    onSuccess: (data) => {
      toast.success('User verified successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['platform-statistics'] });
    },
    onError: (error) => {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user. Please try again.');
    },
  });
}

// Reject User Mutation
export function useRejectUser() {
  const { publicKey } = useWallet();
  const { program } = useCarChainProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['reject-user'],
    mutationFn: async ({ 
      userPublicKey, 
      reason 
    }: { 
      userPublicKey: string; 
      reason: string; 
    }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      const userPubkey = new PublicKey(userPublicKey);
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), userPubkey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .rejectUser(userPublicKey, reason)
        .accounts({
          userPda: userPda,
          government: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, userPublicKey, reason };
    },
    onSuccess: (data) => {
      toast.success('User rejection recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['platform-statistics'] });
    },
    onError: (error) => {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user. Please try again.');
    },
  });
}

// Register Car Mutation (Government only)
export function useRegisterCar() {
  const { publicKey } = useWallet();
  const { program } = useCarChainProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['register-car'],
    mutationFn: async (carData: {
      carId: string;
      vin: string;
      brand: string;
      model: string;
      year: number;
      color: string;
      engineNumber: string;
      ownerUsername: string;
      mileage?: number;
      lastInspectionDate?: string;
      inspectionStatus?: any;
      latestInspectionReport?: string;
    }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      // Find owner by username
      const allUsers = await program.account.userAccount.all();
      
      const owner = allUsers.find(user => 
        user.account.userName === carData.ownerUsername && user.account.verificationStatus?.verified
      );

      if (!owner) {
        throw new Error('Owner not found or not verified');
      }

      // Generate car PDA
      const [carPda, carBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car'),
          publicKey.toBuffer(),
          Buffer.from(carData.vin)
        ],
        program.programId
      );

      // Set default inspection status
      const defaultInspectionStatus = { pending: {} };
      
      const tx = await program.methods
        .registerCar(
          carData.carId,
          carData.vin,
          carData.brand,
          carData.model,
          carData.year,
          carData.color,
          carData.engineNumber,
          owner.account.authority,
          carData.lastInspectionDate || null,
          defaultInspectionStatus,
          carData.latestInspectionReport || null,
          carData.mileage || 0,
          carBump
        )
        .accounts({
          government: publicKey,
          car: carPda,
          owner: owner.account.authority,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, carData };
    },
    onSuccess: (data) => {
      toast.success(`Car ${data.carData.brand} ${data.carData.model} registered successfully!`);
      queryClient.invalidateQueries({ queryKey: ['all-cars'] });
      queryClient.invalidateQueries({ queryKey: ['car-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['platform-statistics'] });
    },
    onError: (error) => {
      console.error('Error registering car:', error);
      toast.error('Failed to register car. Please check the details and try again.');
    },
  });
}

// Assign Inspector Role Mutation
export function useAssignInspectorRole() {
  const { publicKey } = useWallet();
  const { program } = useCarChainProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['assign-inspector'],
    mutationFn: async ({ userPublicKey }: { userPublicKey: string }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      const userPubkey = new PublicKey(userPublicKey);
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), userPubkey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .assignInspectorRole(userPublicKey)
        .accounts({
          userPda: userPda,
          government: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, userPublicKey };
    },
    onSuccess: (data) => {
      toast.success('Inspector role assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['platform-statistics'] });
    },
    onError: (error) => {
      console.error('Error assigning inspector role:', error);
      toast.error('Failed to assign inspector role. Please try again.');
    },
  });
}

// Get System Health Hook
export function useGetSystemHealth() {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const slot = await connection.getSlot();
        const blockTime = await connection.getBlockTime(slot);
        const supply = await connection.getSupply();
        
        return {
          currentSlot: slot,
          blockTime: blockTime ? new Date(blockTime * 1000) : new Date(),
          totalSupply: supply.value.total,
          circulatingSupply: supply.value.circulating,
          uptime: 99.9, // Mock uptime
          avgResponseTime: Math.random() * 2 + 0.5, // Mock response time
        };
      } catch (error) {
        console.error('Error fetching system health:', error);
        return null;
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

// Export transaction history hook
export function useGetTransactionHistory(limit: number = 50) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['transaction-history', limit],
    queryFn: async () => {
      if (!program) return [];

      try {
        // This would require implementing transaction tracking in your program
        // For now, return mock data
        return [
          {
            id: '1',
            type: 'user_verification',
            timestamp: Date.now() - 1000 * 60 * 5,
            details: 'User john_doe verified',
            signature: 'mock_signature_1',
          },
          {
            id: '2',
            type: 'car_registration',
            timestamp: Date.now() - 1000 * 60 * 15,
            details: 'Toyota Camry 2023 registered',
            signature: 'mock_signature_2',
          },
          // Add more mock transactions...
        ];
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }
    },
    enabled: !!program,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// Bulk operations hook
export function useBulkVerifyUsers() {
  const { publicKey } = useWallet();
  const { program } = useCarChainProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['bulk-verify-users'],
    mutationFn: async ({ userPublicKeys }: { userPublicKeys: string[] }) => {
      if (!program || !publicKey) {
        throw new Error('Program not initialized or wallet not connected');
      }

      const results = [];
      for (const userPubKey of userPublicKeys) {
        try {
          const userPubkey = new PublicKey(userPubKey);
          const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user'), userPubkey.toBuffer()],
            program.programId
          );

          const tx = await program.methods
            .verifyUser(userPubKey)
            .accounts({
              userPda: userPda,
              government: publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();

          results.push({ userPublicKey: userPubKey, success: true, signature: tx });
        } catch (error) {
          results.push({ userPublicKey: userPubKey, success: false, error: error });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} users verified successfully!`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} users failed to verify.`);
      }

      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['platform-statistics'] });
    },
    onError: (error) => {
      console.error('Error in bulk verification:', error);
      toast.error('Bulk verification failed. Please try again.');
    },
  });
}


export function useGetAllCars () {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['all-cars'],
    queryFn: async () => {
      
      if (!program) return [];  
      try {
        
        const allCars = await program.account.carAccount.all();
        return allCars.map(car => car.account);
      
      } catch (error) {
        console.error('Error fetching all cars:', error);
        return [];
      }
    }
  })
}