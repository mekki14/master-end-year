// hooks/useInspectorData.ts
import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program } from '@coral-xyz/anchor';
import { CarChain } from '../types/car_chain';

interface InspectorData {
  publicKey: string;
  name: string;
  email: string;
  licenseNumber: string;
  phoneNumber: string;
  verified: boolean;
  verificationDate: string | null;
  specializations: string[];
  reportsCount: number;
  createdAt: string;
  bump: number;
}

export const useInspectorData = (walletPublicKey: PublicKey | null) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useQuery<InspectorData | null>({
    queryKey: ['inspector-data', walletPublicKey?.toString()],
    queryFn: async (): Promise<InspectorData | null> => {
      if (!walletPublicKey || !wallet) {
        return null;
      }

      try {
        // Get the program instance
        const provider = new anchor.AnchorProvider(connection, wallet, {
          commitment: 'confirmed',
        });
        
        // Replace with your actual program ID
        const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
        const program = new Program<CarChain>(
          // You'll need to import your IDL here
          {} as any, // Replace with actual IDL
          programId,
          provider
        );

        // Calculate inspector PDA
        const [inspectorPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('inspector'),
            walletPublicKey.toBuffer(),
          ],
          program.programId
        );

        // Fetch inspector account data
        const inspectorAccount = await program.account.inspector.fetchNullable(inspectorPda);

        if (!inspectorAccount) {
          return null;
        }

        // Transform the account data to match our interface
        return {
          publicKey: inspectorPda.toString(),
          name: inspectorAccount.name,
          email: inspectorAccount.email,
          licenseNumber: inspectorAccount.licenseNumber,
          phoneNumber: inspectorAccount.phoneNumber,
          verified: inspectorAccount.verified,
          verificationDate: inspectorAccount.verificationDate 
            ? new Date(inspectorAccount.verificationDate.toNumber() * 1000).toISOString()
            : null,
          specializations: inspectorAccount.specializations || [],
          reportsCount: inspectorAccount.reportsCount || 0,
          createdAt: inspectorAccount.createdAt 
            ? new Date(inspectorAccount.createdAt.toNumber() * 1000).toISOString()
            : new Date().toISOString(),
          bump: inspectorAccount.bump,
        };

      } catch (error) {
        console.error('Error fetching inspector data:', error);
        
        // For development/testing, return mock data if account not found
        if (process.env.NODE_ENV === 'development') {
          return {
            publicKey: walletPublicKey.toString(),
            name: 'John Inspector',
            email: 'john@inspector.com',
            licenseNumber: 'INS12345',
            phoneNumber: '+1234567890',
            verified: true, // Set to false to test unverified state
            verificationDate: '2024-01-15T10:00:00Z',
            specializations: ['Vehicle Safety', 'Emissions Testing'],
            reportsCount: 5,
            createdAt: '2024-01-01T00:00:00Z',
            bump: 255,
          };
        }
        
        return null;
      }
    },
    enabled: !!walletPublicKey && !!wallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for inspector registration
export const useRegisterInspector = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return async (inspectorData: {
    name: string;
    email: string;
    licenseNumber: string;
    phoneNumber: string;
    specializations?: string[];
  }) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      
      const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
      const program = new Program<CarChain>(
        {} as any, // Replace with actual IDL
        programId,
        provider
      );

      // Calculate inspector PDA
      const [inspectorPda, bump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('inspector'),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Execute register inspector instruction
      const tx = await program.methods
        .registerInspector(
          inspectorData.name,
          inspectorData.email,
          inspectorData.licenseNumber,
          inspectorData.phoneNumber,
          inspectorData.specializations || []
        )
        .accounts({
          inspector: inspectorPda,
          user: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        inspectorPda: inspectorPda.toString(),
        bump,
      };

    } catch (error) {
      console.error('Error registering inspector:', error);
      throw error;
    }
  };
};

// Hook for fetching inspector reports
export const useInspectorReports = (inspectorPublicKey: PublicKey | null) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['inspector-reports', inspectorPublicKey?.toString()],
    queryFn: async () => {
      if (!inspectorPublicKey || !wallet) {
        return [];
      }

      try {
        const provider = new anchor.AnchorProvider(connection, wallet, {
          commitment: 'confirmed',
        });
        
        const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
        const program = new Program<CarChain>(
          {} as any, // Replace with actual IDL
          programId,
          provider
        );

        // Fetch all conformity reports by this inspector
        const reports = await program.account.conformityReport.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator and car pubkey
              bytes: inspectorPublicKey.toBase58(),
            }
          }
        ]);

        return reports.map(report => ({
          publicKey: report.publicKey.toString(),
          car: report.account.car.toString(),
          confirmityExpert: report.account.confirmityExpert.toString(),
          carOwner: report.account.carOwner.toString(),
          reportDate: new Date(report.account.reportDate.toNumber() * 1000).toISOString(),
          conformityStatus: report.account.conformityStatus,
          modifications: report.account.modifications,
          fullReportUri: report.account.fullReportUri,
          minesStamp: report.account.minesStamp,
          notes: report.account.notes,
          status: report.account.status || 'pending',
        }));

      } catch (error) {
        console.error('Error fetching inspector reports:', error);
        
        // Return mock data for development
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              publicKey: 'report1_pubkey',
              car: 'car1_pubkey',
              confirmityExpert: inspectorPublicKey.toString(),
              carOwner: 'owner1_pubkey',
              reportDate: '2024-01-20T10:00:00Z',
              conformityStatus: 'approved',
              modifications: 'None required',
              fullReportUri: 'ipfs://QmReport123',
              minesStamp: 'MINES_STAMP_123',
              notes: 'Vehicle passes all safety requirements',
              status: 'pending'
            }
          ];
        }
        
        return [];
      }
    },
    enabled: !!inspectorPublicKey && !!wallet,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for creating conformity report
export const useCreateConformityReport = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return async (reportData: {
    carVin: string;
    conformityStatus: 'approved' | 'rejected' | 'conditional';
    modifications: string;
    fullReportUri: string;
    minesStamp: string;
    notes: string;
  }) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      
      const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
      const program = new Program<CarChain>(
        {} as any, // Replace with actual IDL
        programId,
        provider
      );

      // Find car PDA by VIN
      const [carPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('car'),
          Buffer.from(reportData.carVin),
        ],
        program.programId
      );

      // Get car account to find owner
      const carAccount = await program.account.car.fetch(carPda);

      // Create unique report ID based on timestamp
      const reportId = new anchor.BN(Date.now());

      // Calculate conformity report PDA
      const [conformityReportPda, bump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('conformity_report'),
          carPda.toBuffer(),
          wallet.publicKey.toBuffer(),
          reportId.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      // Execute create conformity report instruction
      const tx = await program.methods
        .createConformityReport(
          reportId,
          reportData.carVin,
          reportData.conformityStatus === 'approved',
          reportData.modifications,
          reportData.fullReportUri,
          reportData.minesStamp,
          reportData.notes
        )
        .accounts({
          conformityReport: conformityReportPda,
          car: carPda,
          carOwner: carAccount.owner,
          confirmityExpert: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        reportPda: conformityReportPda.toString(),
        reportId: reportId.toString(),
      };

    } catch (error) {
      console.error('Error creating conformity report:', error);
      throw error;
    }
  };
};

// Hook for inspector statistics
export const useInspectorStats = (inspectorPublicKey: PublicKey | null) => {
  const { data: reports = [] } = useInspectorReports(inspectorPublicKey);

  return {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    acceptedReports: reports.filter(r => r.status === 'accepted').length,
    rejectedReports: reports.filter(r => r.status === 'rejected').length,
    approvedInspections: reports.filter(r => r.conformityStatus === 'approved').length,
    rejectedInspections: reports.filter(r => r.conformityStatus === 'rejected').length,
    conditionalInspections: reports.filter(r => r.conformityStatus === 'conditional').length,
  };
};
