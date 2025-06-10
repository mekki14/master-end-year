use anchor_lang::prelude::*;

// محفظة الحكومة (يمكن تغييرها لاحقاً)
pub const GOVERNMENT_AUTHORITY: Pubkey = pubkey!("FPZyc6E2jqfjdWJe7j1Rn4Ac4FC12CR5uRsisMaEKoT2");

// حدود البيانات
pub const MAX_NAME_LENGTH: usize = 50;
pub const MAX_PHONE_LENGTH: usize = 15;
pub const MIN_PHONE_LENGTH: usize = 10;
pub const MAX_VIN_LENGTH: usize = 17;
pub const MAX_MAKE_LENGTH: usize = 30;
pub const MAX_MODEL_LENGTH: usize = 30;

// Seeds للPDAs
pub const USER_SEED: &[u8] = b"user";
pub const CAR_SEED: &[u8] = b"car";
