// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
// import { CarChain } from "../target/types/car_chain";
// import * as fs from "fs";

// describe("RegisterCar Handler Tests", () => {
//     let provider: anchor.AnchorProvider;
//     let program: Program<CarChain>;
//     let governmentKeypair: Keypair;
//     let userKeypair: Keypair;

//     const validCarData = {
//         carId: "CAR001",
//         vin: "1HGBH41JXMN109186",
//         brand: "Toyota",
//         model: "Camry",
//         year: 2023,
//         color: "White",
//         engineNumber: "ENG123456789",
//         lastInspectionDate: null,
//         inspectionStatus: { pending: {} },
//         latestInspectionReport: null,
//         mileage: 0,
//         isForSale: false,
//         salePrice: null,
//         bump: 0
//     };

//     beforeAll(async () => {
//         provider = anchor.AnchorProvider.env();
//         anchor.setProvider(provider);
//         program = anchor.workspace.CarChain as Program<CarChain>;
        
//         const governmentKeyData = JSON.parse(fs.readFileSync("./keys/government-keypair.json", 'utf-8'));
//         governmentKeypair = Keypair.fromSecretKey(new Uint8Array(governmentKeyData));
//         userKeypair = Keypair.generate();
        
//         // Fund accounts
//         const airdropGov = await provider.connection.requestAirdrop(
//             governmentKeypair.publicKey,
//             2 * anchor.web3.LAMPORTS_PER_SOL
//         );
//         const airdropUser = await provider.connection.requestAirdrop(
//             userKeypair.publicKey,
//             1 * anchor.web3.LAMPORTS_PER_SOL
//         );
        
//         await provider.connection.confirmTransaction(airdropGov);
//         await provider.connection.confirmTransaction(airdropUser);
//     });

//     // describe("✅ Successful Registration Tests", () => {
//     //     it("should register car with valid data", async () => {
//     //         const [carPda, bump] = PublicKey.findProgramAddressSync(
//     //             [
//     //                 Buffer.from("car"),
//     //                 governmentKeypair.publicKey.toBuffer(),
//     //                 Buffer.from(validCarData.vin)
//     //             ],
//     //             program.programId
//     //         );

//     //         const tx = await program.methods
//     //             .registerCar(
//     //                 validCarData.carId,
//     //                 validCarData.vin,
//     //                 validCarData.brand,
//     //                 validCarData.model,
//     //                 validCarData.year,
//     //                 validCarData.color,
//     //                 validCarData.engineNumber,
//     //                 userKeypair.publicKey,
//     //                 validCarData.lastInspectionDate,
//     //                 validCarData.inspectionStatus,
//     //                 validCarData.latestInspectionReport,
//     //                 validCarData.mileage,
//     //                 validCarData.isForSale,
//     //                 validCarData.salePrice,
//     //                 bump
//     //             )
//     //             .accounts({
//     //                 government: governmentKeypair.publicKey,
//     //                 car: carPda,
//     //                 owner: userKeypair.publicKey,
//     //                 systemProgram: SystemProgram.programId,
//     //             })
//     //             .signers([governmentKeypair])
//     //             .rpc();

//     //         expect(tx).toBeTruthy();

//     //         const carAccount = await program.account.carAccount.fetch(carPda);
//     //         if (!carAccount) {
//     //             throw new Error("Car account not found");
//     //         }
            
//     //         // Verify all car data matches input
//     //         expect(carAccount).toMatchObject({
//     //             carId: validCarData.carId,
//     //             vin: validCarData.vin,
//     //             brand: validCarData.brand,
//     //             model: validCarData.model,
//     //             year: validCarData.year,
//     //             color: validCarData.color,
//     //             engineNumber: validCarData.engineNumber,
//     //             mileage: validCarData.mileage,
//     //             isForSale: validCarData.isForSale,
//     //             salePrice: validCarData.salePrice,
//     //             isActive: true,
//     //             transferCount: 0
//     //         });

//     //         expect(carAccount.owner.toString()).toBe(userKeypair.publicKey.toString());
//     //         expect(carAccount.registeredBy.toString()).toBe(governmentKeypair.publicKey.toString());
//     //         expect(carAccount.registrationDate).toBeDefined();
//     //     });

//     //     it("should register car with maximum valid values", async () => {
//     //         const maxCarData = {
//     //             ...validCarData,
//     //             carId: "CAR002",
//     //             vin: "ABCDEFGHIJK123456",
//     //             brand: "A".repeat(30),
//     //             model: "B".repeat(30),
//     //             year: 2025,
//     //             mileage: 999999
//     //         };

//     //         const [carPda, bump] = PublicKey.findProgramAddressSync(
//     //             [
//     //                 Buffer.from("car"),
//     //                 governmentKeypair.publicKey.toBuffer(),
//     //                 Buffer.from(maxCarData.vin)
//     //             ],
//     //             program.programId
//     //         );

//     //         const tx = await program.methods
//     //             .registerCar(
//     //                 maxCarData.carId,
//     //                 maxCarData.vin,
//     //                 maxCarData.brand,
//     //                 maxCarData.model,
//     //                 maxCarData.year,
//     //                 maxCarData.color,
//     //                 maxCarData.engineNumber,
//     //                 userKeypair.publicKey,
//     //                 maxCarData.lastInspectionDate,
//     //                 maxCarData.inspectionStatus,
//     //                 maxCarData.latestInspectionReport,
//     //                 maxCarData.mileage,
//     //                 maxCarData.isForSale,
//     //                 maxCarData.salePrice,
//     //                 bump
//     //             )
//     //             .accounts({
//     //                 government: governmentKeypair.publicKey,
//     //                 car: carPda,
//     //                 owner: userKeypair.publicKey,
//     //                 systemProgram: SystemProgram.programId,
//     //             })
//     //             .signers([governmentKeypair])
//     //             .rpc();

//     //         expect(tx).toBeTruthy();

//     //         const carAccount = await program.account.carAccount.fetch(carPda);
//     //         if (!carAccount) {
//     //             throw new Error("Car account not found");
//     //         }
//     //         expect(carAccount.brand).toBe(maxCarData.brand);
//     //         expect(carAccount.model).toBe(maxCarData.model);
//     //         expect(carAccount.year).toBe(maxCarData.year);
//     //         expect(carAccount.mileage).toBe(maxCarData.mileage);
//     //     });
//     // });

//     // describe("❌ Validation Error Tests", () => {
//     //     it("should fail with empty VIN", async () => {
//     //         const invalidData = { ...validCarData, carId: "CAR003", vin: "" };
//     //         const [carPda, bump] = PublicKey.findProgramAddressSync(
//     //             [
//     //                 Buffer.from("car"),
//     //                 governmentKeypair.publicKey.toBuffer(),
//     //                 Buffer.from(invalidData.vin)
//     //             ],
//     //             program.programId
//     //         );

//     //         await expect(
//     //             program.methods
//     //                 .registerCar(
//     //                     invalidData.carId,
//     //                     invalidData.vin,
//     //                     invalidData.brand,
//     //                     invalidData.model,
//     //                     invalidData.year,
//     //                     invalidData.color,
//     //                     invalidData.engineNumber,
//     //                     userKeypair.publicKey,
//     //                     invalidData.lastInspectionDate,
//     //                     invalidData.inspectionStatus,
//     //                     invalidData.latestInspectionReport,
//     //                     invalidData.mileage,
//     //                     invalidData.isForSale,
//     //                     invalidData.salePrice,
//     //                     bump
//     //                 )
//     //                 .accounts({
//     //                     government: governmentKeypair.publicKey,
//     //                     car: carPda,
//     //                     owner: userKeypair.publicKey,
//     //                     systemProgram: SystemProgram.programId,
//     //                 })
//     //                 .signers([governmentKeypair])
//     //                 .rpc()
//     //         ).rejects.toThrow(/InvalidVin/);
//     //     });

//     //     it("should fail with invalid VIN length", async () => {
//     //         const invalidData = { 
//     //             ...validCarData, 
//     //             carId: "CAR004", 
//     //             vin: "SHORT"
//     //         };
            
//     //         const [carPda, bump] = PublicKey.findProgramAddressSync(
//     //             [
//     //                 Buffer.from("car"),
//     //                 governmentKeypair.publicKey.toBuffer(),
//     //                 Buffer.from(invalidData.vin)
//     //             ],
//     //             program.programId
//     //         );

//     //         await expect(
//     //             program.methods
//     //                 .registerCar(
//     //                     invalidData.carId,
//     //                     invalidData.vin,
//     //                     invalidData.brand,
//     //                     invalidData.model,
//     //                     invalidData.year,
//     //                     invalidData.color,
//     //                     invalidData.engineNumber,
//     //                     userKeypair.publicKey,
//     //                     invalidData.lastInspectionDate,
//     //                     invalidData.inspectionStatus,
//     //                     invalidData.latestInspectionReport,
//     //                     invalidData.mileage,
//     //                     invalidData.isForSale,
//     //                     invalidData.salePrice,
//     //                     bump
//     //                 )
//     //                 .accounts({
//     //                     government: governmentKeypair.publicKey,
//     //                     car: carPda,
//     //                     owner: userKeypair.publicKey,
//     //                     systemProgram: SystemProgram.programId,
//     //                 })
//     //                 .signers([governmentKeypair])
//     //                 .rpc()
//     //         ).rejects.toThrow(/InvalidVin/);
//     //     });
//     // });

//     // describe("🔐 Authorization Tests", () => {
//     //     it("should fail when non-government tries to register car", async () => {
//     //         const unauthorizedKeypair = Keypair.generate();
            
//     //         const airdrop = await provider.connection.requestAirdrop(
//     //             unauthorizedKeypair.publicKey,
//     //             1 * anchor.web3.LAMPORTS_PER_SOL
//     //         );
//     //         await provider.connection.confirmTransaction(airdrop);

//     //         const invalidData = { ...validCarData, carId: "CAR012" };
//     //         const [carPda, bump] = PublicKey.findProgramAddressSync(
//     //             [
//     //                 Buffer.from("car"),
//     //                 unauthorizedKeypair.publicKey.toBuffer(),
//     //                 Buffer.from(invalidData.vin)
//     //             ],
//     //             program.programId
//     //         );

//     //         await expect(
//     //             program.methods
//     //                 .registerCar(
//     //                     invalidData.carId,
//     //                     invalidData.vin,
//     //                     invalidData.brand,
//     //                     invalidData.model,
//     //                     invalidData.year,
//     //                     invalidData.color,
//     //                     invalidData.engineNumber,
//     //                     userKeypair.publicKey,
//     //                     invalidData.lastInspectionDate,
//     //                     invalidData.inspectionStatus,
//     //                     invalidData.latestInspectionReport,
//     //                     invalidData.mileage,
//     //                     invalidData.isForSale,
//     //                     invalidData.salePrice,
//     //                     bump
//     //                 )
//     //                 .accounts({
//     //                     government: unauthorizedKeypair.publicKey,
//     //                     car: carPda,
//     //                     owner: userKeypair.publicKey,
//     //                     systemProgram: SystemProgram.programId,
//     //                 })
//     //                 .signers([unauthorizedKeypair])
//     //                 .rpc()
//     //         ).rejects.toThrow(/Unauthorized/);
//     //     });
//     // });

// // describe("🏷️ SetCarForSale Handler Tests", () => {
// //     it("should successfully set car for sale", async () => {
// //         // First register a car
// //         const carData = { ...validCarData, carId: "CAR_SALE_001" };
// //         const [carPda, bump] = PublicKey.findProgramAddressSync(
// //             [
// //                 Buffer.from("car"),
// //                 governmentKeypair.publicKey.toBuffer(),
// //                 Buffer.from(carData.vin)
// //             ],
// //             program.programId
// //         );
  
// //         // Register the car first
// //                 const tx1 = await program.methods
// //                 .registerCar(
// //                     validCarData.carId,
// //                     validCarData.vin,
// //                     validCarData.brand,
// //                     validCarData.model,
// //                     validCarData.year,
// //                     validCarData.color,
// //                     validCarData.engineNumber,
// //                     userKeypair.publicKey,
// //                     validCarData.lastInspectionDate,
// //                     validCarData.inspectionStatus,
// //                     validCarData.latestInspectionReport,
// //                     validCarData.mileage,
// //                     validCarData.isForSale,
// //                     validCarData.salePrice,
// //                     bump
// //                 )
// //                 .accounts({
// //                     government: governmentKeypair.publicKey,
// //                     car: carPda,
// //                     owner: userKeypair.publicKey,
// //                     systemProgram: SystemProgram.programId,
// //                 })
// //                 .signers([governmentKeypair])
// //                 .rpc();

// //         // Now set the car for sale
// //         const salePrice = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);
        
        
// //         const tx = await program.methods
// //                 .setForSale(carData.vin, salePrice)
// //                 .accounts({
// //                     carAccount: carPda,
// //                     owner: userKeypair.publicKey,
// //                     systemProgram: SystemProgram.programId,
// //                 })
// //                 .signers([userKeypair])
// //                 .rpc();
// //             expect(tx).toBeTruthy();

// //             // Verify the car is now for sale
// //             const carAccount = await program.account.carAccount.fetch(carPda);
// //             console.log(carAccount.salePrice.toString())
// //             console.log(salePrice.toString())
// //             expect(carAccount.isForSale).toBe(true);
// //             expect(carAccount.salePrice.toString()).toBe(salePrice.toString());

       
// //     });
// //     it("should fail when non-owner tries to set car for sale", async () => {
// //         // Create and fund non-owner account
// //         const nonOwner = Keypair.generate();
// //         const airdropNonOwner = await provider.connection.requestAirdrop(
// //             nonOwner.publicKey,
// //             1 * anchor.web3.LAMPORTS_PER_SOL
// //         );
// //         await provider.connection.confirmTransaction(airdropNonOwner);

// //         // Setup car data and PDA
// //         const carData = { ...validCarData, carId: "CAR_SALE_002", vin: "1HGBH41JXMN109196" };
// //         const [carPda, bump] = PublicKey.findProgramAddressSync(
// //             [
// //                 Buffer.from("car"),
// //                 governmentKeypair.publicKey.toBuffer(),
// //                 Buffer.from(carData.vin)
// //             ],
// //             program.programId
// //         );

// //         // Register the car first
// //         try {
// //         await program.methods
// //             .registerCar(
// //               carData.carId,
// //               carData.vin,
// //               carData.brand,
// //               carData.model,
// //               carData.year,
// //               carData.color,
// //               carData.engineNumber,
// //                 userKeypair.publicKey,
// //                 carData.lastInspectionDate,
// //                 carData.inspectionStatus,
// //                 carData.latestInspectionReport,
// //                 carData.mileage,
// //                 carData.isForSale,
// //                 carData.salePrice,
// //                 bump
// //             )
// //             .accounts({
// //                 government: governmentKeypair.publicKey,
// //                 car: carPda,
// //                 owner: userKeypair.publicKey,
// //                 systemProgram: SystemProgram.programId,
// //             })
// //             .signers([governmentKeypair])
// //             .rpc();
// //           } catch (error) {
// //             console.error(error)
// //               expect(error.toString()).toMatch(/Unauthorized/);
// //           }

// //         // Attempt to set car for sale with non-owner
// //         const salePrice = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);
        
// // try {
// //     await program.methods
// //         .setForSale(carData.vin, salePrice)
// //         .accounts({
// //             carAccount: carPda,
// //             owner: nonOwner.publicKey,
// //             systemProgram: SystemProgram.programId,
// //         })
// //         .signers([nonOwner])
// //         .rpc();
// //     // If we reach here, the test should fail
// // } catch (error) {
// //   console.error(error)
// //     expect(error.toString()).toMatch(/Unauthorized/);
// // }





// //     });

    
// //   })

// describe("🚫 CancelCarForSale Handler Tests", () => {
//     it("should successfully cancel car for sale", async () => {
//         // First register a car and set it for sale
//         const carData = { ...validCarData, carId: "CAR_CANCEL_001", vin: "1HGBH41JXMN109187" };
//         const [carPda, bump] = PublicKey.findProgramAddressSync(
//             [
//                 Buffer.from("car"),
//                 governmentKeypair.publicKey.toBuffer(),
//                 Buffer.from(carData.vin)
//             ],
//             program.programId
//         );

//         // Register the car
//         await program.methods
//             .registerCar(
//                 carData.carId,
//                 carData.vin,
//                 carData.brand,
//                 carData.model,
//                 carData.year,
//                 carData.color,
//                 carData.engineNumber,
//                 userKeypair.publicKey,
//                 carData.lastInspectionDate,
//                 carData.inspectionStatus,
//                 carData.latestInspectionReport,
//                 carData.mileage,
//                 carData.isForSale,
//                 carData.salePrice,
//                 bump
//             )
//             .accounts({
//                 government: governmentKeypair.publicKey,
//                 car: carPda,
//                 owner: userKeypair.publicKey,
//                 systemProgram: SystemProgram.programId,
//             })
//             .signers([governmentKeypair])
//             .rpc();

//         // Set the car for sale
//         const salePrice = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL);
//         await program.methods
//             .setForSale(carData.vin, salePrice)
//             .accounts({
//                 carAccount: carPda,
//                 owner: userKeypair.publicKey,
//                 systemProgram: SystemProgram.programId,
//             })
//             .signers([userKeypair])
//             .rpc();

//         // Now cancel the sale
//         const tx = await program.methods
//             .cancelForSale(carData.vin)
//             .accounts({
//                 carAccount: carPda,
//                 owner: userKeypair.publicKey,
//                 systemProgram: SystemProgram.programId,
//             })
//             .signers([userKeypair])
//             .rpc();

//         expect(tx).toBeTruthy();

//         // Verify the car is no longer for sale
//         const carAccount = await program.account.carAccount.fetch(carPda);
//         expect(carAccount.isForSale).toBe(false);
//         expect(carAccount.salePrice).toBeNull();
//     });

// });


//     afterAll(async () => {
//         console.log("✅ All RegisterCar tests completed");
//     });
// });
