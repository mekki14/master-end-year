// import * as anchor from '@coral-xyz/anchor';
// import { Program } from '@coral-xyz/anchor';
// import {
//   PublicKey,
//   Keypair,
//   SystemProgram,
//   LAMPORTS_PER_SOL,
// } from '@solana/web3.js';
// import { CarChain } from '../target/types/car_chain';
// import * as fs from 'fs';

// describe('Send Buy Request Tests', () => {
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);
//   const program = anchor.workspace.CarChain as Program<CarChain>;

//   let carPda: anchor.web3.PublicKey;
//   let carBump: number;
//   let buyRequestPda: anchor.web3.PublicKey;
//   let buyer: anchor.web3.Keypair;
//   let seller: anchor.web3.Keypair;
//   let buyerPda: anchor.web3.PublicKey;
//   let buyerBump: number;
//   let sellerPda: anchor.web3.PublicKey;
//   let sellerBump: number;
//   let governmentKeypair: Keypair;
// //   const vin = 'TEST123456789';

//   const testUsers = {
//     user1: {
//       userName: 'Ahmed Mohammed',
//       publicDataUri: 'ipfs://QmPublicData123abc',
//       privateDataUri: 'ipfs://QmPrivateData456def',
//       encryptedKeyForGov: 'encrypted_gov_key_abc123',
//       encryptedKeyForUser: 'encrypted_user_key_def456',
//       role: { normal: {} }, // or { government: {} } based on your definition
//     },
//     user2: {
//       userName: 'Fatima Salem',
//       publicDataUri: 'ipfs://QmPublicData789ghi',
//       privateDataUri: 'ipfs://QmPrivateData012jkl',
//       encryptedKeyForGov: 'encrypted_gov_key_ghi789',
//       encryptedKeyForUser: 'encrypted_user_key_jkl012',
//       role: { normal: {} },
//     },
//   };

//   const validCarData = {
//     carId: 'CAR001',
//     vin: '1HGBH41JXMN109186',
//     brand: 'Toyota',
//     model: 'Camry',
//     year: 2023,
//     color: 'White',
//     engineNumber: 'ENG123456789',
//     lastInspectionDate: null,
//     inspectionStatus: { pending: {} },
//     latestInspectionReport: null,
//     mileage: 0,
//     isForSale: false,
//     salePrice: null,
//     bump: 0,
//   };
//   beforeAll(async () => {

//     buyer = anchor.web3.Keypair.generate();
//     seller = anchor.web3.Keypair.generate();
//     const governmentKeypairData = JSON.parse(
//       fs.readFileSync('./keys/government-keypair.json', 'utf8')
//     );

//     governmentKeypair = Keypair.fromSecretKey(
//       new Uint8Array(governmentKeypairData)
//     );

//     const users = [
//       { keypair: buyer, name: 'Buyer' },
//       { keypair: seller, name: 'Seller' },
//       { keypair: governmentKeypair, name: 'Government' },
//     ];

//     for (const user of users) {
//       const airdropTx = await provider.connection.requestAirdrop(
//         user.keypair.publicKey,
//         10 * LAMPORTS_PER_SOL
//       );

//       await provider.connection.confirmTransaction(airdropTx, 'confirmed');

//       const balance = await provider.connection.getBalance(
//         user.keypair.publicKey
//       );
//       console.log(`💰 ${user.name} balance: ${balance / LAMPORTS_PER_SOL} SOL`);

//       expect(balance).toBeGreaterThan(0);
//     }

//     // Derive PDAs
//     [carPda, carBump] = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from('car'),
//         governmentKeypair.publicKey.toBuffer(),
//         Buffer.from(validCarData.vin),
//       ],
//       program.programId
//     );

//     [buyRequestPda] = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from('buy_request'),
//         Buffer.from(validCarData.vin),
//         buyer.publicKey.toBuffer(),
//       ],
//       program.programId
//     );

//     [buyerPda, buyerBump] = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         anchor.utils.bytes.utf8.encode('user'),
//         buyer.publicKey.toBuffer(),
//         anchor.utils.bytes.utf8.encode(testUsers.user1.userName),
//       ],
//       program.programId
//     );

//     [sellerPda,sellerBump] = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         anchor.utils.bytes.utf8.encode('user'),
//         seller.publicKey.toBuffer(),
//         anchor.utils.bytes.utf8.encode(testUsers.user2.userName),
//       ],
//       program.programId
//     );

//     console.log(`👤 buyer Address: ${buyer.publicKey.toString()}`);
//     console.log(
//       `🏛️ Government Address: ${governmentKeypair.publicKey.toString()}`
//     );
//     console.log(`👥 seller User Address: ${seller.publicKey.toString()}`);

//     // Initialize seller user account
//     const tx = await program.methods
//       .registerUser(
//         testUsers.user1.userName,
//         testUsers.user1.publicDataUri,
//         testUsers.user1.privateDataUri,
//         testUsers.user1.encryptedKeyForGov,
//         testUsers.user1.encryptedKeyForUser,
//         testUsers.user1.role
//       )
//       .accounts({
//         userAccount: buyerPda,
//         userSigner: buyer.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([buyer])
//       .rpc();

//     console.log(`✅ Transaction sent: ${tx}`);
//     const tx1 = await program.methods
//       .verifyUser(testUsers.user1.userName, true) // approve = true
//       .accounts({
//         userAccount: buyerPda,
//         government: governmentKeypair.publicKey, // Make sure this address is authorized in program
//       })
//       .signers([governmentKeypair])
//       .rpc();

//     console.log(`✅ Transaction sent: ${tx1}`);
//     const tx2 = await program.methods
//       .registerUser(
//         testUsers.user2.userName,
//         testUsers.user2.publicDataUri,
//         testUsers.user2.privateDataUri,
//         testUsers.user2.encryptedKeyForGov,
//         testUsers.user2.encryptedKeyForUser,
//         testUsers.user2.role
//       )
//       .accounts({
//         userAccount: sellerPda,
//         userSigner: seller.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([seller])
//       .rpc();

//     console.log(`✅ Transaction sent: ${tx2}`);
//     const tx3 = await program.methods
//       .verifyUser(testUsers.user2.userName, true) // approve = true
//       .accounts({
//         userAccount: sellerPda,
//         government: governmentKeypair.publicKey, // Make sure this address is authorized in program
//       })
//       .signers([governmentKeypair])
//       .rpc();

//     console.log(`✅ Transaction sent: ${tx3}`);

//     // Initialize car account
//     const tx4 = await program.methods
//       .registerCar(
//         validCarData.carId,
//         validCarData.vin,
//         validCarData.brand,
//         validCarData.model,
//         validCarData.year,
//         validCarData.color,
//         validCarData.engineNumber,
//         seller.publicKey,
//         validCarData.lastInspectionDate,
//         validCarData.inspectionStatus,
//         validCarData.latestInspectionReport,
//         validCarData.mileage,
//         carBump
//       )
//       .accounts({
//         government: governmentKeypair.publicKey,
//         car: carPda,
//         owner: seller.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([governmentKeypair])
//       .rpc();
//       console.log(tx4)

//     // Mark car for sale
//            const salePrice = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);
        
        
//         const tx5 = await program.methods
//                 .setForSale(validCarData.vin, salePrice)
//                 .accounts({
//                     carAccount: carPda,
//                     owner: seller.publicKey,
//                     systemProgram: SystemProgram.programId,
//                 })
//                 .signers([seller])
//                 .rpc();
//             expect(tx5).toBeTruthy();
//   }, 15000);

//   test('should successfully create a buy request', async () => {
//     const message = 'I would like to buy this car';

//     // Create buy request
//     const tx = await program.methods
//       .requestBuy(validCarData.vin, message)
//       .accounts({
//         buyRequest: buyRequestPda,
//         car: carPda,
//         buyerPda: buyerPda,
//         buyer: buyer.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([buyer])
//       .rpc()
//       .catch(error => {
//         console.error('Failed to create buy request:', error);
//         throw error;
//       });

//     console.log("Buy request created:", tx);

//     // Fetch and verify the created buy request
//     const buyRequest = await program.account.buyRequest.fetch(buyRequestPda)
//       .catch(error => {
//         console.error('Failed to fetch buy request:', error);
//         return null;
//       });

//     // Verify buy request exists and has correct data
//     expect(buyRequest).toBeTruthy();
//     expect(buyRequest.vin).toBe(validCarData.vin);
//     expect(buyRequest.buyer.toString()).toBe(buyer.publicKey.toString());
//     expect(buyRequest.status).toEqual({ pending: {} });
//     expect(buyRequest.message).toBe(message);
//   }, 15000);

//   test('should successfully accept a buy request', async () => {
//     // Accept the buy request
//     try {
//       await program.methods
//       .acceptBuyRequest(validCarData.vin,buyer.publicKey)
//       .accounts({
//        buyRequest: buyRequestPda,
//        car: carPda,
//        ownerPda: sellerPda,
//        buyerPda: buyerPda,
//        owner: seller.publicKey,
//        buyerAccount: buyer.publicKey,
//        systemProgram: anchor.web3.SystemProgram.programId,
      
//        }).signers([seller])
//        .rpc();

//     } catch (error) {
//       console.error(error)
//     }
   

//     // Check the buy request status
//     const buyRequest = await program.account.buyRequest.fetch(buyRequestPda).catch(() => null);
// if(!buyRequest) { throw new Error('Account does not exist or has no data'); }
//     expect(buyRequest.status).toEqual({ accepted: {} });
//   })

// // test('should successfully reject a buy request', async () => {
// //   try {
// //     // Reject the buy request
// //     const tx = await program.methods
// //       .rejectBuyRequest(validCarData.vin)
// //       .accounts({
// //         seller: seller.publicKey,
// //         car: carPda,
// //         buyRequest: buyRequestPda,
// //         buyer: buyer.publicKey,
// //         systemProgram: anchor.web3.SystemProgram.programId,
// //       })
// //       .signers([seller])
// //       .rpc();

// //     console.log("Buy request rejected:", tx);

// //     // Verify the buy request was closed by trying to fetch it
// //     try {
// //       await program.account.buyRequest.fetch(buyRequestPda);
// //       throw new Error('Buy request should have been closed');
// //     } catch (error) {
// //       // Expected error - account was closed
// //       expect(error.toString()).toContain('Account does not exist');
// //     }

// //     // Verify the buyer received the refunded lamports
// //     const buyerBalance = await provider.connection.getBalance(buyer.publicKey);
// //     expect(buyerBalance).toBeGreaterThan(0);

// //   } catch (error) {
// //     console.error('Failed to reject buy request:', error);
// //     throw error;
// //   }
// // }, 15000);

// test('should successfully transfer car ownership', async () => {
//   try {
//     // Attempt to transfer the car ownership
//     const tx = await program.methods
//       .transferCar(validCarData.vin, testUsers.user2.userName)
//       .accounts({
//         car: carPda,
//         currentOwner: buyer.publicKey,
//         newOwner: seller.publicKey,
//         newOwnerPda: sellerPda,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([seller,buyer])
//       .rpc();

//     console.log("Car ownership transferred:", tx);

//     // Fetch the car account to verify ownership transfer
//     const carAccount = await program.account.carAccount.fetch(carPda);
    
//     // Verify the new owner is set correctly
//     expect(carAccount.owner.toString()).toBe(seller.publicKey.toString());
    
//     // Verify the transaction was successful
//     expect(tx).toBeTruthy();

//   } catch (error) {
//     console.error('Failed to transfer car ownership:', error);
//     throw error;
//   }
// }, 15000);



 

// //   test('should fail when buyer is not verified', async () => {
// //     await expect(
// //       program.methods
// //         .sendBuyRequest(vin, null)
// //         .accounts({
// //           buyRequest: buyRequestPda,
// //           car: carPda,
// //           buyer: buyer.publicKey,
// //           systemProgram: anchor.web3.SystemProgram.programId,
// //         })
// //         .signers([buyer])
// //         .rpc()
// //     ).rejects.toThrow('UserNotVerified');
// //   });
// });
