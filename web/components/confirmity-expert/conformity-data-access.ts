'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useCarChainProgram } from '../hooks/use-car-chain';
import { useGetCurrentInspectorUser } from '../users/user-data-access';

export interface ConformityReportData {
  reportId: number;
  carVin: string;
  conformityExpertUsername: string;
  conformityStatus: boolean;
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  notes: string;
}

export interface ConformityReport {
    reportId: string;
  publicKey: string;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: number;
  conformityStatus: boolean;
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  acceptedByOwner: boolean;
  notes: string;
  bump: number;
}

export interface CarData {
  publicKey: string;
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  owner: string;
  bump: number;
}

const GOVERNMENT_AUTHORITY = new PublicKey('FPZyc6E2jqfjdWJe7j1Rn4Ac4FC12CR5uRsisMaEKoT2'); // Replace with actual key

export function useCreateConformityReport() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-conformity-report'],
    mutationFn: async ({ 
      reportData, 
      car, 
    }: { 
      reportData: ConformityReportData;
      car: CarData;
    }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      // Generate report ID based on timestamp
      const reportId = new anchor.BN(Date.now());
      
      // Calculate PDAs
      const [carPda, carBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car'),
          GOVERNMENT_AUTHORITY.toBuffer(),
          Buffer.from(reportData.carVin),
        ],
        program.programId
      );

      const [conformityReportPda, conformityReportBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('conformity_report'),
          carPda.toBuffer(),
          publicKey.toBuffer(),
          reportId.toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      );

      const [confirmityExpertPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user'),
          publicKey.toBuffer(),
          anchor.utils.bytes.utf8.encode(reportData.conformityExpertUsername),
        ],
        program.programId
      );

      // Create the transaction
      const tx = await program.methods
        .issueConfirmityReport(
          reportId,
          reportData.carVin,
          reportData.conformityStatus,
          reportData.modifications,
          reportData.fullReportUri,
          reportData.minesStamp,
          reportData.notes
        )
        .accounts({
          conformityReport: conformityReportPda,
          car: carPda,
          confirmityExpert: confirmityExpertPda,
          confirmityExpertSigner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      return {
        signature: tx,
        conformityReportPda,
        reportId: reportId.toNumber(),
      };
    },
    onSuccess: (data) => {
      toast.success('Conformity report created successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: ['conformity-reports'] });
      queryClient.invalidateQueries({ queryKey: ['expert-reports'] });
    },
    onError: (error: any) => {
      console.error('Failed to create conformity report:', error);
      const errorMessage = error.message || 'Failed to create conformity report';
      toast.error(errorMessage);
    },
  });
}

export function useConformityReports(carVin?: string) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['conformity-reports', carVin],
    queryFn: async () => {
      if (!program ) return [];

      try {
        // Get all conformity report accounts
        const reports = await program.account.conformityReport.all();
        
        console.log("conformity reports", reports);
        
        // Filter by car VIN if provided
        if (carVin) {
          const [carPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('car'),
              GOVERNMENT_AUTHORITY.toBuffer(),
              Buffer.from(carVin),
            ],
            program.programId
          );

          return reports
            .filter(report => report.account.car.equals(carPda))
            .map(report => ({
                reportId: report.account.reportId.toNumber(),
              publicKey: report.publicKey.toString(),
              car: report.account.car.toString(),
              confirmityExpert: report.account.confirmityExpert.toString(),
              carOwner: report.account.carOwner.toString(),
              reportDate: report.account.reportDate.toNumber(),
              conformityStatus: report.account.conformityStatus,
              modifications: report.account.modifications,
              fullReportUri: report.account.fullReportUri,
              minesStamp: report.account.minesStamp,
              acceptedByOwner: report.account.acceptedByOwner,
              notes: report.account.notes,
              bump: report.account.bump,
            }));
        }

        return reports.map(report => ({
            reportId: report.account.reportId.toNumber(),
          publicKey: report.publicKey.toString(),
          car: report.account.car.toString(),
          confirmityExpert: report.account.confirmityExpert.toString(),
          carOwner: report.account.carOwner.toString(),
          reportDate: report.account.reportDate.toNumber(),
          conformityStatus: report.account.conformityStatus,
          modifications: report.account.modifications,
          fullReportUri: report.account.fullReportUri,
          minesStamp: report.account.minesStamp,
          acceptedByOwner: report.account.acceptedByOwner,
          notes: report.account.notes,
          bump: report.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching conformity reports:', error);
        return [];
      }
    },
    enabled: !!program,
  });
}

export function useExpertReports() {
  const { program } = useCarChainProgram();
  const { data: userData } = useGetCurrentInspectorUser();
  const { publicKey } = useWallet();
  
  return useQuery({
    queryKey: ['expert-reports', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey || !userData?.userPda) return [];

      try {
        const allReports = await program.account.conformityReport.all();
        
        const reports = allReports.filter(report => 
          report.account.confirmityExpert.equals(userData.userPda)
        );

        return reports.map(report => ({
          publicKey: report.publicKey.toString(),
          car: report.account.car.toString(),
          confirmityExpert: report.account.confirmityExpert.toString(),
          carOwner: report.account.carOwner.toString(),
          reportDate: report.account.reportDate.toNumber(),
          conformityStatus: report.account.conformityStatus,
          modifications: report.account.modifications,
          fullReportUri: report.account.fullReportUri,
          minesStamp: report.account.minesStamp,
          acceptedByOwner: report.account.acceptedByOwner,
          notes: report.account.notes,
          bump: report.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching expert reports:', error);
        return [];
      }
    },
    enabled: !!program && !!publicKey && !!userData?.userPda,
  });
}

export function useApproveConformityReport() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['approve-conformity-report'],
    mutationFn: async ({ 
      reportPda,
      reportId,
      carVin 
    }: { 
      reportPda: string;
      reportId: number;
      carVin: string;
    }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      const [carPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car'),
          GOVERNMENT_AUTHORITY.toBuffer(),
          Buffer.from(carVin),
        ],
        program.programId
      );

      // Convert reportId to BN and then to buffer
      const reportIdBN = new anchor.BN(reportId);
      const reportIdBuffer = reportIdBN.toArrayLike(Buffer, 'le', 8);

      // Note: You'll need to implement the accept_conformity_report instruction in your program
      const tx = await program.methods
        .acceptConfirmityReport(reportIdBN)
        .accounts({
          conformityReport: new PublicKey(reportPda),
          car: carPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      return tx;
    },
    onSuccess: () => {
      toast.success('Conformity report approved successfully! ✅');
      queryClient.invalidateQueries({ queryKey: ['conformity-reports'] });
    },
    onError: (error: any) => {
      console.error('Failed to approve conformity report:', error);
      toast.error('Failed to approve conformity report');
    },
  });
}

export function useConformityReportStats() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['conformity-report-stats', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return null;

      try {
        const reports = await program.account.conformityReport.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator and car pubkey
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        const totalReports = reports.length;
        const approvedReports = reports.filter(r => r.account.acceptedByOwner).length;
        const pendingReports = totalReports - approvedReports;
        const conformingReports = reports.filter(r => r.account.conformityStatus).length;
        const nonConformingReports = totalReports - conformingReports;

        return {
          totalReports,
          approvedReports,
          pendingReports,
          conformingReports,
          nonConformingReports,
          conformityRate: totalReports > 0 ? Math.round((conformingReports / totalReports) * 100) : 0,
        };
      } catch (error) {
        console.error('Error fetching conformity report stats:', error);
        return null;
      }
    },
    enabled: !!program && !!publicKey,
  });
}

// Helper function to get conformity status color
export function getConformityStatusColor(status: boolean): string {
  return status ? 'text-success' : 'text-error';
}

// Helper function to get conformity status badge
export function getConformityStatusBadge(status: boolean): {
  color: string;
  text: string;
} {
  return status 
    ? { color: 'badge-success', text: 'Conforming' }
    : { color: 'badge-error', text: 'Non-Conforming' };
}

// Helper function to format report date
export function formatReportDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to get approval status badge
export function getApprovalStatusBadge(approved: boolean): {
  color: string;
  text: string;
} {
  return approved 
    ? { color: 'badge-success', text: 'Approved' }
    : { color: 'badge-warning', text: 'Pending Approval' };
}
