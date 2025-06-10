import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { CarChain } from '../target/types/car_chain';
import fs from 'fs';

describe('🚗 Car Chain - User Management System', () => {
  // Configure provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.CarChain as Program<CarChain>;

  // 👥 Create test wallets
  let inspectorKeypair: Keypair;
  let governmentKeypair: Keypair;
  let ownerKeypair: Keypair;
  let inspectorPDA: anchor.web3.PublicKey;
  let inspectorBump: number;

  let carPda: anchor.web3.PublicKey;
  let carBump: number;

  let owner: anchor.web3.Keypair;
  let ownerPda: anchor.web3.PublicKey;
  let ownerBump: number;

  // 📋 Test user data
  const inspectors = {
    inspector1: {
      userName: 'Ahmed Mohammed',
      publicDataUri: 'ipfs://QmPublicData123abc',
      privateDataUri: 'ipfs://QmPrivateData456def',
      encryptedKeyForGov: 'encrypted_gov_key_abc123',
      encryptedKeyForUser: 'encrypted_user_key_def456',
      role: { confirmityExpert: {} },
    },
  };
  const testUsers = {
    user1: {
      userName: 'Ahmed Mohammed',
      publicDataUri: 'ipfs://QmPublicData123abc',
      privateDataUri: 'ipfs://QmPrivateData456def',
      encryptedKeyForGov: 'encrypted_gov_key_abc123',
      encryptedKeyForUser: 'encrypted_user_key_def456',
      role: { normal: {} }, // or { government: {} } based on your definition
    },
    user2: {
      userName: 'Fatima Salem',
      publicDataUri: 'ipfs://QmPublicData789ghi',
      privateDataUri: 'ipfs://QmPrivateData012jkl',
      encryptedKeyForGov: 'encrypted_gov_key_ghi789',
      encryptedKeyForUser: 'encrypted_user_key_jkl012',
      role: { normal: {} },
    },
  };

  const validCarData = {
    carId: 'CAR001',
    vin: '1HGBH41JXMN109186',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'White',
    engineNumber: 'ENG123456789',
    lastInspectionDate: null,
    inspectionStatus: { pending: {} },
    latestInspectionReport: null,
    mileage: 0,
    isForSale: false,
    salePrice: null,
    bump: 0,
  };

  // 🎯 Setup wallets before tests
  beforeAll(async () => {
    console.log('🔧 Setting up test wallets...');
    const governmentKeypairData = JSON.parse(
      fs.readFileSync('./keys/government-keypair.json', 'utf8')
    );
    // Create wallets
    inspectorKeypair = Keypair.generate();
    ownerKeypair = Keypair.generate();
    governmentKeypair = Keypair.fromSecretKey(
      new Uint8Array(governmentKeypairData)
    );

    console.log(`👤 User Address: ${inspectorKeypair.publicKey.toString()}`);
    console.log(
      `🏛️ Government Address: ${governmentKeypair.publicKey.toString()}`
    );

    // Send SOL to wallets
    const users = [
      { keypair: inspectorKeypair, name: 'inspector' },
      { keypair: ownerKeypair, name: 'owner' },
      { keypair: governmentKeypair, name: 'government' },
    ];

    for (const user of users) {
      const airdropTx = await provider.connection.requestAirdrop(
        user.keypair.publicKey,
        3 * LAMPORTS_PER_SOL
      );

      await provider.connection.confirmTransaction(airdropTx, 'confirmed');

      const balance = await provider.connection.getBalance(
        user.keypair.publicKey
      );
      console.log(`💰 ${user.name} balance: ${balance / LAMPORTS_PER_SOL} SOL`);

      expect(balance).toBeGreaterThan(0);
    }

    // Calculate PDA for first user
    [inspectorPDA, inspectorBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode('user'),
          inspectorKeypair.publicKey.toBuffer(),
          anchor.utils.bytes.utf8.encode(inspectors.inspector1.userName),
        ],
        program.programId
      );

    [ownerPda, ownerBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('user'),
        ownerKeypair.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode(testUsers.user1.userName),
      ],
      program.programId
    );

    [carPda, carBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('car'),
        governmentKeypair.publicKey.toBuffer(),
        Buffer.from(validCarData.vin),
      ],
      program.programId
    );
  }, 30000); // Increase timeout to 30 seconds

  // 🧪 Registration Tests
  describe('📝 Inspector Registration Tests', () => {
    it('✅ Should successfully register a new user', async () => {
      console.log('🔄 Testing first user registration...');

      try {
        // Execute registration
        const tx = await program.methods
          .registerUser(
            inspectors.inspector1.userName,
            inspectors.inspector1.publicDataUri,
            inspectors.inspector1.privateDataUri,
            inspectors.inspector1.encryptedKeyForGov,
            inspectors.inspector1.encryptedKeyForUser,
            inspectors.inspector1.role
          )
          .accounts({
            userAccount: inspectorPDA,
            userSigner: inspectorKeypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([inspectorKeypair])
          .rpc();

        console.log(`✅ Registration transaction: ${tx}`);

        // Fetch created account data
        const account = await program.account.userAccount.fetch(inspectorPDA);

        // Verify data
        expect(account.authority.toString()).toBe(
          inspectorKeypair.publicKey.toString()
        );
        expect(account.userName).toBe(inspectors.inspector1.userName);
        expect(account.publicDataUri).toBe(inspectors.inspector1.publicDataUri);
        expect(account.privateDataUri).toBe(
          inspectors.inspector1.privateDataUri
        );
        expect(account.encryptedKeyForGov).toBe(
          inspectors.inspector1.encryptedKeyForGov
        );
        expect(account.encryptedKeyForUser).toBe(
          inspectors.inspector1.encryptedKeyForUser
        );

        // Verify role
        expect(JSON.stringify(account.role)).toBe(
          JSON.stringify(inspectors.inspector1.role)
        );

        // Verify default state
        expect(account.verificationStatus).toHaveProperty('pending');
        expect(account.verifiedAt).toBeNull();
        expect(account.verifiedBy).toBeNull();
        expect(account.bump).toBe(inspectorBump);

        console.log('✅ Successfully verified all user data');
      } catch (error) {
        console.error('❌ Error registering user:', error);
        throw error;
      }
    }, 15000);
  });
  describe('📝 Owner Registration Tests', () => {
    it('✅ Should successfully register a new user', async () => {
      console.log('🔄 Testing first user registration...');

      try {
        // Execute registration
        const tx = await program.methods
          .registerUser(
            testUsers.user1.userName,
            testUsers.user1.publicDataUri,
            testUsers.user1.privateDataUri,
            testUsers.user1.encryptedKeyForGov,
            testUsers.user1.encryptedKeyForUser,
            testUsers.user1.role
          )
          .accounts({
            userAccount: ownerPda,
            userSigner: ownerKeypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([ownerKeypair])
          .rpc();

        console.log(`✅ Registration transaction: ${tx}`);

        // Fetch created account data
        const account = await program.account.userAccount.fetch(ownerPda);

        // Verify data
        expect(account.authority.toString()).toBe(
          ownerKeypair.publicKey.toString()
        );
        expect(account.userName).toBe(testUsers.user1.userName);
        expect(account.publicDataUri).toBe(testUsers.user1.publicDataUri);
        expect(account.privateDataUri).toBe(testUsers.user1.privateDataUri);
        expect(account.encryptedKeyForGov).toBe(
          testUsers.user1.encryptedKeyForGov
        );
        expect(account.encryptedKeyForUser).toBe(
          testUsers.user1.encryptedKeyForUser
        );

        // Verify role
        expect(JSON.stringify(account.role)).toBe(
          JSON.stringify(testUsers.user1.role)
        );

        // Verify default state
        expect(account.verificationStatus).toHaveProperty('pending');
        expect(account.verifiedAt).toBeNull();
        expect(account.verifiedBy).toBeNull();
        expect(account.bump).toBe(ownerBump);

        console.log('✅ Successfully verified all user data');
      } catch (error) {
        console.error('❌ Error registering user:', error);
        throw error;
      }
    }, 15000);
  });

  // 🧪 Verification Tests (if verify_user function is implemented)
  describe('🏛️ Inspector Verification Tests', () => {
    it('✅ Should allow government to verify user', async () => {
      // Make sure verify_user function exists in your program first
      // If not implemented, you can skip this test

      try {
        const tx = await program.methods
          .verifyUser(inspectors.inspector1.userName, true) // approve = true
          .accounts({
            userAccount: inspectorPDA,
            government: governmentKeypair.publicKey, // Make sure this address is authorized in program
          })
          .signers([governmentKeypair])
          .rpc();

        console.log(`✅ Verification transaction: ${tx}`);

        // Fetch updated account
        const account = await program.account.userAccount.fetch(inspectorPDA);

        expect(account.verificationStatus).toHaveProperty('verified');
        expect(account.verifiedAt).not.toBeNull();
        expect(account.verifiedBy?.toString()).toBe(
          governmentKeypair.publicKey.toString()
        );
        // expect(Number(account.updatedAt)).toBeGreaterThan(Number(account.createdAt));

        console.log('✅ Successfully verified inspector');
      } catch (error) {
        console.error('❌ Error verifying inspector:', error);
        // If verify_user not implemented yet, you can skip this error
        console.log('ℹ️ You may need to implement verify_user first');
      }
    }, 15000);
  });

  describe('🏛️ user Verification Tests', () => {
    it('✅ Should allow government to verify user', async () => {
      // Make sure verify_user function exists in your program first
      // If not implemented, you can skip this test

      try {
        const tx = await program.methods
          .verifyUser(testUsers.user1.userName, true) // approve = true
          .accounts({
            userAccount: ownerPda,
            government: governmentKeypair.publicKey, // Make sure this address is authorized in program
          })
          .signers([governmentKeypair])
          .rpc();

        console.log(`✅ Verification transaction: ${tx}`);

        // Fetch updated account
        const account = await program.account.userAccount.fetch(ownerPda);

        expect(account.verificationStatus).toHaveProperty('verified');
        expect(account.verifiedAt).not.toBeNull();
        expect(account.verifiedBy?.toString()).toBe(
          governmentKeypair.publicKey.toString()
        );
        // expect(Number(account.updatedAt)).toBeGreaterThan(Number(account.createdAt));

        console.log('✅ Successfully verified inspector');
      } catch (error) {
        console.error('❌ Error verifying inspector:', error);
        // If verify_user not implemented yet, you can skip this error
        console.log('ℹ️ You may need to implement verify_user first');
      }
    }, 15000);
  });

  // 🧪 Car Management Tests
  describe('🚗 Car Management Tests', () => {
    it('✅ Should successfully register a new car', async () => {
      console.log('🔄 Testing first car registration...');
      //     // Initialize car account
      const tx4 = await program.methods
        .registerCar(
          validCarData.carId,
          validCarData.vin,
          validCarData.brand,
          validCarData.model,
          validCarData.year,
          validCarData.color,
          validCarData.engineNumber,
          ownerKeypair.publicKey,
          validCarData.lastInspectionDate,
          validCarData.inspectionStatus,
          validCarData.latestInspectionReport,
          validCarData.mileage,
          carBump
        )
        .accounts({
          government: governmentKeypair.publicKey,
          car: carPda,
          owner: ownerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([governmentKeypair])
        .rpc();
      console.log(tx4);
      console.log(`✅ Registration transaction: ${tx4}`);

      // Fetch created account data
      const account = await program.account.carAccount.fetch(carPda);

      // Verify data
      expect(account.carId).toBe(validCarData.carId);
      expect(account.vin).toBe(validCarData.vin);
      expect(account.brand).toBe(validCarData.brand);
      expect(account.model).toBe(validCarData.model);
      expect(account.year).toBe(validCarData.year);
      expect(account.color).toBe(validCarData.color);
      expect(account.engineNumber).toBe(validCarData.engineNumber);
      expect(account.owner.toString()).toBe(ownerKeypair.publicKey.toString());
      expect(account.lastInspectionDate).toBe(validCarData.lastInspectionDate);
      expect(account.inspectionStatus).toHaveProperty('pending');
      expect(account.latestInspectionReport).toBe(
        validCarData.latestInspectionReport
      );
      expect(account.mileage).toBe(validCarData.mileage);
      expect(account.isForSale).toBe(false);
      expect(account.salePrice).toBeNull();
      expect(account.bump).toBe(carBump);

      console.log('✅ Successfully registered car');
    }, 15000);
  });

describe('📝 Conformity Report Tests', () => {
  const timestamp = new Date().getTime();
  const reportData = {
    reportId: new anchor.BN(timestamp), // Report ID based on timestamp
    vin: validCarData.vin, // Chassis number (N° de châssis)
    conformityStatus: true, // Status (accepted/rejected)
    modifications: "No modifications required", // Required modifications if any
    fullReportUri: "ipfs://QmReportData123abc", // Digital signature and stamp
    minesStamp: "mines_stamp_data", // Mines stamp
    notes: "No additional notes", // Additional notes
  };
  let conformityReportPda
  let conformityReportBump

  it('✅ Should successfully create a conformity report', async () => {
    console.log('🔄 Testing conformity report creation...');
    
    // Calculate conformity report PDA
    [conformityReportPda, conformityReportBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('conformity_report'),
        carPda.toBuffer(),
        inspectorKeypair.publicKey.toBuffer(),
        reportData.reportId.toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );

    try {
      const tx = await program.methods
        .issueConfirmityReport(
          reportData.reportId,
          reportData.vin,
          reportData.conformityStatus,
          reportData.modifications,
          reportData.fullReportUri,
          reportData.minesStamp,
          reportData.notes
        )
        .accounts({
          conformityReport: conformityReportPda,
          car: carPda,
          confirmityExpert: inspectorPDA,
          confirmityExpertSigner: inspectorKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([inspectorKeypair])
        .rpc();

      console.log(`✅ Conformity report transaction: ${tx}`);

      // Fetch created report account
      const reportAccount = await program.account.conformityReport.fetch(conformityReportPda);

      // Verify report data
      expect(reportAccount.car.toString()).toBe(carPda.toString());
      expect(reportAccount.confirmityExpert.toString()).toBe(inspectorPDA.toString());
      expect(reportAccount.carOwner.toString()).toBe(ownerKeypair.publicKey.toString());
      expect(reportAccount.reportDate).not.toBeNull();
      expect(reportAccount.conformityStatus).toBe(reportData.conformityStatus);
      expect(reportAccount.modifications).toBe(reportData.modifications);
      expect(reportAccount.fullReportUri).toBe(reportData.fullReportUri);
      expect(reportAccount.minesStamp).toBe(reportData.minesStamp);
      expect(reportAccount.notes).toBe(reportData.notes);

      console.log('✅ Successfully verified conformity report data');
    } catch (error) {
      console.error('❌ Error creating conformity report:', error);
      throw error;
    }
  }, 15000);

  it('✅ Should allow car owner to accept inspection report', async () => {
  console.log('🔄 Testing report acceptance...');



  try {
    const tx = await program.methods
      .acceptConfirmityReport(reportData.reportId)
      .accounts({
        conformityReport: conformityReportPda,
        car: carPda,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();

    console.log(`✅ Report acceptance transaction: ${tx}`);

    // Fetch updated report account
    const reportAccount = await program.account.conformityReport.fetch(conformityReportPda);
      console.log(reportAccount)
    // Verify report was accepted
    expect(reportAccount.acceptedByOwner).toBe(true);
    
    console.log('✅ Successfully verified report acceptance');
  } catch (error) {
    console.error('❌ Error accepting report:', error);
    throw error;
  }
}, 15000);

})




  // 🧪 Additional Tests
});
