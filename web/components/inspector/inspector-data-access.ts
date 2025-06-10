'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { CarChain } from '../types/car-chain';
import toast from 'react-hot-toast';
import { useCarChainProgram } from '../hooks/use-car-chain';
import { useGetCurrentInspectorUser, useGetCurrentUser } from '../users/user-data-access';

export interface CarReportData {
  reportId: number;
  carVin: string;
  inspectorUsername: string;
  overallCondition: number;
  engineCondition: number;
  bodyCondition: number;
  fullReportUri: string;
  reportSummary: string;
  notes: string;
}

export interface CarReport {
  publicKey: string;
  car: string;
  inspector: string;
  carOwner: string;
  reportDate: number;
  overallCondition: number;
  engineCondition: number;
  bodyCondition: number;
  fullReportUri: string;
  reportSummary: string;
  approvedByOwner: boolean;
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


export function useCreateCarReport() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-car-report'],
    mutationFn: async ({ 
      reportData, 
      car, 
    }: { 
      reportData: CarReportData;
      car: CarData;
    }) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      // Generate report ID based on timestamp
      const reportId = new anchor.BN(Date.now(), 64);
      
      // Calculate PDAs
      const [carPda, carBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car'),
          GOVERNMENT_AUTHORITY.toBuffer(),
          Buffer.from(reportData.carVin),
        ],
        program.programId
      );

      const [carReportPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car_report'),
          carPda.toBuffer(),
          publicKey.toBuffer(),
          reportId.toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      );

      const [inspectorPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user'),
          publicKey.toBuffer(),
          anchor.utils.bytes.utf8.encode(reportData.inspectorUsername),
        ],
        program.programId
      );

      // Create the transaction
      const tx = await program.methods
        .issueCarReport(
          reportId,
          reportData.carVin,
          reportData.overallCondition,
          reportData.engineCondition,
          reportData.bodyCondition,
          reportData.fullReportUri,
          reportData.reportSummary,
          reportData.notes
        )
        .accounts({
          carReport: carReportPda,
          car: carPda,
          inspector: inspectorPda,
          inspectorSigner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      return {
        signature: tx,
        carReportPda,
        reportId: reportId.toNumber(),
      };
    },
    onSuccess: (data) => {
      toast.success('Inspection report created successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: ['car-reports'] });
      queryClient.invalidateQueries({ queryKey: ['inspector-reports'] });
    },
    onError: (error: any) => {
      console.error('Failed to create report:', error);
      const errorMessage = error.message || 'Failed to create inspection report';
      toast.error(errorMessage);
    },
  });
}

export function useCarReports(carVin?: string) {
  const { program } = useCarChainProgram();

  return useQuery({
    queryKey: ['car-reports', carVin],
    queryFn: async () => {
      if (!program || !carVin) return [];

      try {
        // Get all car report accounts
        const reports = await program.account.carReport.all();
        
        console.log("reports",reports)
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
                reportId: report.account.reportId,
              publicKey: report.publicKey.toString(),
              car: report.account.car.toString(),
              inspector: report.account.inspector.toString(),
              carOwner: report.account.carOwner.toString(),
              reportDate: report.account.reportDate.toNumber(),
              overallCondition: report.account.overallCondition,
              engineCondition: report.account.engineCondition,
              bodyCondition: report.account.bodyCondition,
              fullReportUri: report.account.fullReportUri,
              reportSummary: report.account.reportSummary,
              approvedByOwner: report.account.approvedByOwner,
              notes: report.account.notes,
              bump: report.account.bump,
            }));
        }

        return reports.map(report => ({
            reportId: report.account.reportId,
          publicKey: report.publicKey.toString(),
          car: report.account.car.toString(),
          inspector: report.account.inspector.toString(),
          carOwner: report.account.carOwner.toString(),
          reportDate: report.account.reportDate.toNumber(),
          overallCondition: report.account.overallCondition,
          engineCondition: report.account.engineCondition,
          bodyCondition: report.account.bodyCondition,
          fullReportUri: report.account.fullReportUri,
          reportSummary: report.account.reportSummary,
          approvedByOwner: report.account.approvedByOwner,
          notes: report.account.notes,
          bump: report.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching car reports:', error);
        return [];
      }
    },
    enabled: !!program,
  });
}

export function useInspectorReports() {
  const { program } = useCarChainProgram();
  const { data: userData } = useGetCurrentInspectorUser();
  const { publicKey } = useWallet();
  const userPda = userData?.userPda;
  console.log("userPda",userPda)
  return useQuery({
    queryKey: ['inspector-reports', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return [];

      try {
        const allReports = await program.account.carReport.all();
        
        const reports = allReports.filter(report => 
          report.account.inspector.equals(userData?.userPda)
        );

        return reports.map(report => ({
            reportId: report.account.reportId,
          publicKey: report.publicKey.toString(),
          car: report.account.car.toString(),
          inspector: report.account.inspector.toString(),
          carOwner: report.account.carOwner.toString(),
          reportDate: report.account.reportDate.toNumber(),
          overallCondition: report.account.overallCondition,
          engineCondition: report.account.engineCondition,
          bodyCondition: report.account.bodyCondition,
          fullReportUri: report.account.fullReportUri,
          reportSummary: report.account.reportSummary,
          approvedByOwner: report.account.approvedByOwner,
          notes: report.account.notes,
          bump: report.account.bump,
        }));
      } catch (error) {
        console.error('Error fetching inspector reports:', error);
        return [];
      }
    },
    enabled: !!program && !!publicKey,
  });
}

export function useApproveCarReport() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['approve-car-report'],
    mutationFn: async ({ 
        reportPda,
        reportId, 
      carVin 
    }: { 
        reportId: any;
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

      const tx = await program.methods
        .acceptReport(reportId)
        .accounts({
          report: new PublicKey(reportPda),
          car: carPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      return tx;
    },
    onSuccess: () => {
      toast.success('Report approved successfully! ✅');
      queryClient.invalidateQueries({ queryKey: ['car-reports'] });
    },
    onError: (error: any) => {
      console.error('Failed to approve report:', error);
      toast.error('Failed to approve report');
    },
  });
}

export function useCarReportStats() {
  const { program } = useCarChainProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['car-report-stats', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return null;

      try {
        const reports = await program.account.carReport.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator and car pubkey
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        const totalReports = reports.length;
        const approvedReports = reports.filter(r => r.account.approvedByOwner).length;
        const pendingReports = totalReports - approvedReports;

        const avgOverallCondition = reports.length > 0 
          ? reports.reduce((sum, r) => sum + r.account.overallCondition, 0) / reports.length 
          : 0;

        return {
          totalReports,
          approvedReports,
          pendingReports,
          avgOverallCondition: Math.round(avgOverallCondition * 10) / 10,
        };
      } catch (error) {
        console.error('Error fetching report stats:', error);
        return null;
      }
    },
    enabled: !!program && !!publicKey,
  });
}

// Helper function to get condition color
export function getConditionColor(condition: number): string {
  if (condition >= 8) return 'text-success';
  if (condition >= 6) return 'text-warning';
  return 'text-error';
}

// Helper function to get condition badge
export function getConditionBadge(condition: number): {
  color: string;
  text: string;
} {
  if (condition >= 8) return { color: 'badge-success', text: 'Excellent' };
  if (condition >= 6) return { color: 'badge-warning', text: 'Good' };
  if (condition >= 4) return { color: 'badge-warning', text: 'Fair' };
  return { color: 'badge-error', text: 'Poor' };
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
