// src/components/user/user-data-access.ts
'use client';

import * as anchor from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAnchorProvider } from '../solana/solana-provider';
import { getCarChainProgram, getCarChainProgramId } from '@anchor-ping/anchor';
import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import type { Cluster } from '@solana/web3.js';
import { useMemo } from 'react';

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