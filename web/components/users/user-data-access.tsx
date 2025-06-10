// src/components/user/user-data-access.ts
'use client';

import * as anchor from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAnchorProvider } from '../solana/solana-provider';
import { getCarChainProgram, getCarChainProgramId } from '@anchor-ping/anchor';
import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useMemo } from 'react';
import type { Cluster } from '@solana/web3.js';

export enum UserRole {
  Owner = 'owner',
  Inspector = 'inspector',
  ConfirmityExpert = 'confirmityExpert',
  Government = 'government',
}

export interface UserAccount {
  userName: string;
  publicKey: PublicKey;
  publicDataUri: string;
  privateDataUri: string;
  encryptedKeyForGov: string;
  encryptedKeyForUser: string;
  role: UserRole;
  isVerified: boolean;
  createdTimestamp: anchor.BN;
  bump: number;
}

export function useCarChainProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getCarChainProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getCarChainProgram(provider);

  return {
    program,
    programId
  };
}

// Hook to get wallet balance
export function useBalance(publicKey: PublicKey | null) {
  const { connection } = useConnection();
  
  return useQuery({
    queryKey: ['balance', publicKey?.toString(), connection.rpcEndpoint],
    queryFn: async (): Promise<number> => {
      if (!publicKey) return 0;
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: !!publicKey,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Hook to get current user account
export function useGetCurrentUser() {
  const { publicKey } = useWallet();
  const { program, programId } = useCarChainProgram();
  
  return useQuery({
    queryKey: ['get-current-user', publicKey?.toString()],
    queryFn: async (): Promise<{ user: UserAccount; userPda: PublicKey } | null> => {
      if (!publicKey || !program) {
        return null;
      }

      try {
        // Get all user accounts and find one that belongs to this wallet
        const userAccounts = await program.account.userAccount.all();
        const userAccount = userAccounts.find(
          account => account.account.authority.equals(publicKey)
        );
        console.log("user account",userAccount)

        if (userAccount) {
          return {
            user: userAccount.account as UserAccount,
            userPda: userAccount.publicKey,
          };
        }
        return null;
      } catch (error) {
        console.log('Error fetching current user:', error);
        return null;
      }
    },
    enabled: !!publicKey && !!program,
  });
}
export function useGetCurrentInspectorUser() {
  const { publicKey } = useWallet();
  const { program, programId } = useCarChainProgram();
  
  return useQuery({
    queryKey: ['get-current-user', publicKey?.toString()],
    queryFn: async (): Promise<{ user: UserAccount; userPda: PublicKey } | null> => {
      if (!publicKey || !program) {
        return null;
      }

      try {
        // Get all user accounts and find one that belongs to this wallet
        const userAccounts = await program.account.userAccount.all();
        const userAccount = userAccounts.find(
          account => account.account.authority.equals(publicKey) && 
          Object.keys(account.account.role)[0] === 'inspector'
        );
        console.log("user account",userAccount)

        if (userAccount) {
          return {
            user: userAccount.account as UserAccount,
            userPda: userAccount.publicKey,
          };
        }
        return null;
      } catch (error) {
        console.log('Error fetching current user:', error);
        return null;
      }
    },
    enabled: !!publicKey && !!program,
  });
}

export function useGetUser(publicKey: PublicKey | null, username: string | null) {
  const { connection } = useConnection();
  const { program, programId } = useCarChainProgram();
  
  return useQuery({
    queryKey: ['get-user', publicKey?.toString(), username, connection.rpcEndpoint],
    queryFn: async (): Promise<{ user: UserAccount; username: string } | null> => {
      if (!publicKey || !username || !program) {
        return null;
      }

      try {
        // Derive PDA for user account
        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), publicKey.toBuffer(), Buffer.from(username)],
          programId
        );
        
        const userAccount = await program.account.userAccount.fetch(userPda);
        return {
          user: userAccount as UserAccount,
          username: userAccount.userName,
        };
      } catch (error) {
        console.log('Error fetching user by wallet:', error);
        return null;
      }
    },
    enabled: !!publicKey && !!username && !!program,
  });
}

// Hook to search user by username only
export function useSearchUserByUsername(username: string) {
  const { program } = useCarChainProgram();
  
  return useQuery({
    queryKey: ['search-user', username],
    queryFn: async (): Promise<{ user: UserAccount; userPda: PublicKey } | null> => {
      if (!username || !program) {
        return null;
      }

      try {
        // Get all user accounts and find one with matching username
        const userAccounts = await program.account.userAccount.all();
        const userAccount = userAccounts.find(
          account => account.account.userName === username
        );

        if (userAccount) {
          return {
            user: userAccount.account as UserAccount,
            userPda: userAccount.publicKey,
          };
        }
        return null;
      } catch (error) {
        console.log('Error searching user by username:', error);
        return null;
      }
    },
    enabled: !!username && !!program,
  });
}

export function useRegisterUser() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { program, programId } = useCarChainProgram();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ['register-user', connection.rpcEndpoint],
    mutationFn: async (input: {
      userName: string;
      publicDataUri: string;
      privateDataUri: string;
      encryptedKeyForGov: string;
      encryptedKeyForUser: string;
      role: UserRole;
    }) => {
      if (!publicKey || !signTransaction || !program) {
        throw new Error('Wallet not connected');
      }

      // Derive PDA for user account
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), publicKey.toBuffer(), Buffer.from(input.userName)],
        programId
      );

      // Convert role to the format expected by the program
      const roleForProgram = input.role === UserRole.ConfirmityExpert 
        ? { confirmityExpert: {} }
        : input.role === UserRole.Inspector 
          ? { inspector: {} }
          : { normal: {} };
      console.log(roleForProgram)
      const tx = await program.methods
        .registerUser(
          input.userName,
          input.publicDataUri,
          input.privateDataUri,
          input.encryptedKeyForGov,
          input.encryptedKeyForUser,
          roleForProgram
        )
        .accounts({
          userAccount: userPda,
          userSigner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, userPda };
    },
    onSuccess: (result) => {
      toast.success('🎉 User registered successfully! Waiting for government verification.');
      client.invalidateQueries({ queryKey: ['get-current-user'] });
      client.invalidateQueries({ queryKey: ['search-user'] });
    },
    onError: (error) => {
      toast.error(`❌ Registration failed: ${error.message}`);
    },
  });
}
