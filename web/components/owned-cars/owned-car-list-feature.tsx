// src/components/user/user-account-feature.tsx
'use client';

import { WalletButton } from '../solana/solana-provider';
import { useWallet } from '@solana/wallet-adapter-react';
import { CarAccountFeature } from './car-account-ui';

export default function CarAccountPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="hero min-h-[50vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Connect Wallet</h1>
            <p className="py-6">
              Connect your wallet to access your car chain account
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
      );
    }

  return <CarAccountFeature />;

}