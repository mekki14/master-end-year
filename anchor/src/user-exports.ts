// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import CarChainIDL from '../target/idl/car_chain.json';
import type { CarChain } from '../target/types/car_chain';

// Re-export the generated IDL and type
export { CarChain, CarChainIDL };

// The programId is imported from the program IDL.
export const CARCHAIN_PROGRAM_ID = new PublicKey(CarChainIDL.address);

// This is a helper function to get the CarChain Anchor program.
export function getCarChainProgram(provider: AnchorProvider){
  return new Program(CarChainIDL as CarChain , provider);
}

// This is a helper function to get the program ID for the CarChain program depending on the cluster.
export function getCarChainProgramId(cluster: Cluster): PublicKey {
  switch (cluster) {
    case 'devnet':
      return new PublicKey('EcGhLkbDw9rWoJXgwfQiJEy32THQftmVY3mQwKxY6xk1');
    case 'testnet':
    case 'mainnet-beta':
    default:
      return CARCHAIN_PROGRAM_ID;
  }
}
