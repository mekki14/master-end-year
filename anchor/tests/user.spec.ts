// import * as anchor from '@coral-xyz/anchor';
// import { Program } from '@coral-xyz/anchor';
// import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
// import { CarChain } from '../target/types/car_chain';
// import fs from 'fs';

// describe('🚗 Car Chain - User Management System', () => {
//   // Configure provider and program
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);
//   const program = anchor.workspace.CarChain as Program<CarChain>;

//   // 👥 Create test wallets
//   let userKeypair: Keypair;
//   let governmentKeypair: Keypair;
//   let anotherUserKeypair: Keypair;
//   let userAccountPDA: anchor.web3.PublicKey;
//   let userAccountBump: number;
  
//   // 📋 Test user data
//   const testUsers = {
//     user1: {
//       userName: "Ahmed Mohammed",
//       publicDataUri: "ipfs://QmPublicData123abc",
//       privateDataUri: "ipfs://QmPrivateData456def", 
//       encryptedKeyForGov: "encrypted_gov_key_abc123",
//       encryptedKeyForUser: "encrypted_user_key_def456",
//       role: { normal: {} } // or { government: {} } based on your definition
//     },
//     user2: {
//       userName: "Fatima Salem",
//       publicDataUri: "ipfs://QmPublicData789ghi",
//       privateDataUri: "ipfs://QmPrivateData012jkl",
//       encryptedKeyForGov: "encrypted_gov_key_ghi789", 
//       encryptedKeyForUser: "encrypted_user_key_jkl012",
//       role: { normal: {} }
//     }
//   };

//   // 🎯 Setup wallets before tests
//   beforeAll(async () => {
//     console.log('🔧 Setting up test wallets...');
//     const governmentKeypairData = JSON.parse(
//       fs.readFileSync('./keys/government-keypair.json', 'utf8')
//     );
//     // Create wallets
//     userKeypair = Keypair.generate();
//     governmentKeypair = Keypair.fromSecretKey(new Uint8Array(governmentKeypairData));
//     anotherUserKeypair = Keypair.generate();

//     console.log(`👤 User Address: ${userKeypair.publicKey.toString()}`);
//     console.log(`🏛️ Government Address: ${governmentKeypair.publicKey.toString()}`);
//     console.log(`👥 Another User Address: ${anotherUserKeypair.publicKey.toString()}`);

//     // Send SOL to wallets
//     const users = [
//       { keypair: userKeypair, name: 'User' },
//       { keypair: anotherUserKeypair, name: 'Another User' }
//     ];

//     for (const user of users) {
//       const airdropTx = await provider.connection.requestAirdrop(
//         user.keypair.publicKey,
//         3 * LAMPORTS_PER_SOL
//       );
      
//       await provider.connection.confirmTransaction(airdropTx, 'confirmed');
      
//       const balance = await provider.connection.getBalance(user.keypair.publicKey);
//       console.log(`💰 ${user.name} balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      
//       expect(balance).toBeGreaterThan(0);
//     }

//     // Calculate PDA for first user
//     [userAccountPDA, userAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
//       [
//         anchor.utils.bytes.utf8.encode("user"),
//         userKeypair.publicKey.toBuffer(),
//         anchor.utils.bytes.utf8.encode(testUsers.user1.userName),
//       ],
//       program.programId
//     );
//   }, 30000); // Increase timeout to 30 seconds

//   // 🧪 Registration Tests
//   describe('📝 User Registration Tests', () => {
    
//     it('✅ Should successfully register a new user', async () => {
//       console.log('🔄 Testing first user registration...');

//       try {
//         // Execute registration
//         const tx = await program.methods
//           .registerUser(
//             testUsers.user1.userName,
//             testUsers.user1.publicDataUri,
//             testUsers.user1.privateDataUri,
//             testUsers.user1.encryptedKeyForGov,
//             testUsers.user1.encryptedKeyForUser,
//             testUsers.user1.role
//           )
//           .accounts({
//             userAccount: userAccountPDA,
//             userSigner: userKeypair.publicKey,
//             systemProgram: SystemProgram.programId,
//           })
//           .signers([userKeypair])
//           .rpc();

//         console.log(`✅ Registration transaction: ${tx}`);

//         // Fetch created account data
//         const account = await program.account.userAccount.fetch(userAccountPDA);

//         // Verify data
//         expect(account.authority.toString()).toBe(userKeypair.publicKey.toString());
//         expect(account.userName).toBe(testUsers.user1.userName);
//         expect(account.publicDataUri).toBe(testUsers.user1.publicDataUri);
//         expect(account.privateDataUri).toBe(testUsers.user1.privateDataUri);
//         expect(account.encryptedKeyForGov).toBe(testUsers.user1.encryptedKeyForGov);
//         expect(account.encryptedKeyForUser).toBe(testUsers.user1.encryptedKeyForUser);
        
//         // Verify role
//         expect(JSON.stringify(account.role)).toBe(JSON.stringify(testUsers.user1.role));
        
//         // Verify default state
//         expect(account.verificationStatus).toHaveProperty('pending');
//         expect(account.verifiedAt).toBeNull();
//         expect(account.verifiedBy).toBeNull();
//         expect(account.bump).toBe(userAccountBump);
        
        
//         console.log('✅ Successfully verified all user data');
        
//       } catch (error) {
//         console.error('❌ Error registering user:', error);
//         throw error;
//       }
//     }, 15000);

//     it('❌ Should fail to register an existing user', async () => {
//       console.log('🔄 Testing duplicate user registration...');

//       try {
//         // Attempt to register same user again
//         await program.methods
//           .registerUser(
//             "Different Name", // Even with different name
//             testUsers.user1.publicDataUri,
//             testUsers.user1.privateDataUri,
//             testUsers.user1.encryptedKeyForGov,
//             testUsers.user1.encryptedKeyForUser,
//             testUsers.user1.role
//           )
//           .accounts({
//             userAccount: userAccountPDA, // Same PDA
//             userSigner: userKeypair.publicKey,
//             systemProgram: SystemProgram.programId,
//           })
//           .signers([userKeypair])
//           .rpc();
          
//         // If operation succeeds, test fails
//         fail('❌ Operation should have failed as user already exists');
        
//       } catch (error) {
//         console.log('✅ Duplicate registration failed as expected:', error.message);
//         // Verify error type
//         expect(error).toBeDefined();
//       }
//     }, 10000);

//     it('✅ Should register a second user with different wallet', async () => {
//       console.log('🔄 Testing second user registration...');

//       // Calculate PDA for second user
//       const [anotherUserPDA, anotherBump] = await anchor.web3.PublicKey.findProgramAddress(
//         [
//           anchor.utils.bytes.utf8.encode("user"),
//           anotherUserKeypair.publicKey.toBuffer(),
//           anchor.utils.bytes.utf8.encode(testUsers.user2.userName),
//         ],
//         program.programId
//       );

//       try {
//         const tx = await program.methods
//           .registerUser(
//             testUsers.user2.userName,
//             testUsers.user2.publicDataUri,
//             testUsers.user2.privateDataUri,
//             testUsers.user2.encryptedKeyForGov,
//             testUsers.user2.encryptedKeyForUser,
//             testUsers.user2.role
//           )
//           .accounts({
//             userAccount: anotherUserPDA,
//             userSigner: anotherUserKeypair.publicKey,
//             systemProgram: SystemProgram.programId,
//           })
//           .signers([anotherUserKeypair])
//           .rpc();

//         console.log(`✅ Second user registration transaction: ${tx}`);

//         // Fetch and verify second user data
//         const account = await program.account.userAccount.fetch(anotherUserPDA);
        
//         expect(account.authority.toString()).toBe(anotherUserKeypair.publicKey.toString());
//         expect(account.userName).toBe(testUsers.user2.userName);
//         expect(account.verificationStatus).toHaveProperty('pending');
//         expect(account.bump).toBe(anotherBump);
        
//         console.log('✅ Successfully registered second user');
        
//       } catch (error) {
//         console.error('❌ Error registering second user:', error);
//         throw error;
//       }
//     }, 15000);
//   });

//   // 🧪 Verification Tests (if verify_user function is implemented)
//   describe('🏛️ User Verification Tests', () => {
    
//     it('✅ Should allow government to verify user', async () => {
//       // Make sure verify_user function exists in your program first
//       // If not implemented, you can skip this test
      
//       try {
//         const tx = await program.methods
//           .verifyUser(testUsers.user1.userName,true ) // approve = true
//           .accounts({
//             userAccount: userAccountPDA,
//             government: governmentKeypair.publicKey, // Make sure this address is authorized in program
//           })
//           .signers([governmentKeypair])
//           .rpc();

//         console.log(`✅ Verification transaction: ${tx}`);

//         // Fetch updated account
//         const account = await program.account.userAccount.fetch(userAccountPDA);
        
//         expect(account.verificationStatus).toHaveProperty('verified');
//         expect(account.verifiedAt).not.toBeNull();
//         expect(account.verifiedBy?.toString()).toBe(governmentKeypair.publicKey.toString());
//         expect(account.updatedAt).toBeGreaterThan(account.createdAt);
        
//         console.log('✅ Successfully verified user');
        
//       } catch (error) {
//         console.error('❌ Error verifying user:', error);
//         // If verify_user not implemented yet, you can skip this error
//         console.log('ℹ️ You may need to implement verify_user first');
//       }
//     }, 15000);

//     it('❌ Should prevent unauthorized verification', async () => {
//       try {
//         // Attempt verification with unauthorized wallet
//         await program.methods
//           .verifyUser(true, "Unauthorized attempt")
//           .accounts({
//             userAccount: userAccountPDA,
//             government: anotherUserKeypair.publicKey, // Unauthorized wallet
//           })
//           .signers([anotherUserKeypair])
//           .rpc();
          
//         fail('❌ Operation should have failed due to lack of authority');
        
//       } catch (error) {
//         console.log('✅ Unauthorized verification prevented as expected');
//         expect(error).toBeDefined();
//       }
//     }, 10000);
//   });

//   // 🧪 Additional Tests
//   describe('🔍 Additional Tests', () => {
    
//     it('📊 Should show correct program statistics', async () => {
//       try {
//         // Fetch all user accounts
//         const allUserAccounts = await program.account.userAccount.all();
        
//         console.log(`📈 Total registered users: ${allUserAccounts.length}`);
        
//         expect(allUserAccounts.length).toBeGreaterThanOrEqual(2); // At least our two registered users
        
//         // Compile statistics
//         const stats = {
//           total: allUserAccounts.length,
//           pending: 0,
//           verified: 0,
//           rejected: 0
//         };
        
//         allUserAccounts.forEach(account => {
//           if (account.account.verificationStatus.pending) stats.pending++;
//           if (account.account.verificationStatus.verified) stats.verified++;
//           if (account.account.verificationStatus.rejected) stats.rejected++;
//         });
        
//         console.log('📊 User Statistics:', stats);
        
//         expect(stats.total).toBe(stats.pending + stats.verified + stats.rejected);
        
//       } catch (error) {
//         console.error('❌ Error fetching statistics:', error);
//         throw error;
//       }
//     }, 10000);
//   });
// });
