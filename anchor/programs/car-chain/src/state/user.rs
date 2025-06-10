use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    pub authority: Pubkey,      // عنوان محفظة المستخدم
    pub user_name: String,           // اسم المستخدم
    pub public_data_uri: String,
    pub private_data_uri: String,
    pub encrypted_key_for_gov: String,
    pub encrypted_key_for_user: String,
    pub role: UserRoles,
    pub verification_status: VerificationStatus,     // حالة التوثيق
    pub verified_at: Option<i64>,  // 9 bytes
    pub verified_by: Option<Pubkey>, // 33 bytes
    pub created_at: i64,        // تاريخ الإنشاء
    pub updated_at: i64,        // تاريخ آخر تحديث
    pub bump: u8,               // PDA bump
}

impl UserAccount {
    // Define max lengths for string fields
    const MAX_USER_NAME_LEN: usize = 50;
    const MAX_PUBLIC_DATA_URI_LEN: usize = 200;
    const MAX_PRIVATE_DATA_URI_LEN: usize = 200;
    const MAX_ENCRYPTED_KEY_LEN: usize = 100;

    pub const LEN: usize = 8 + // discriminator
        32 + // authority (Pubkey)
        (4 + Self::MAX_USER_NAME_LEN) + // user_name (String)
        (4 + Self::MAX_PUBLIC_DATA_URI_LEN) + // public_data_uri (String)
        (4 + Self::MAX_PRIVATE_DATA_URI_LEN) + // private_data_uri (String)
        (4 + Self::MAX_ENCRYPTED_KEY_LEN) + // encrypted_key_for_gov (String)
        (4 + Self::MAX_ENCRYPTED_KEY_LEN) + // encrypted_key_for_user (String)
        1 + // role (UserRoles enum - 1 byte for discriminant)
        1 + // verification_status (VerificationStatus enum - 1 byte)
        9 + // verified_at (Option<i64>)
        33 + // verified_by (Option<Pubkey>)
        8 + // created_at (i64)
        8 + // updated_at (i64)
        1; // bump (u8)

    pub fn initialize(
        &mut self,
        authority: Pubkey,      // عنوان محفظة المستخدم
        user_name: String,           // اسم المستخدم
        public_data_uri: String,
        private_data_uri: String,
        encrypted_key_for_gov: String,
        encrypted_key_for_user: String,
        role: UserRoles,
        timestamp: i64,
        bump: u8,
    ) -> Result<()> {
        self.authority = authority;
        self.user_name = user_name;
        self.public_data_uri = public_data_uri;
        self.private_data_uri = private_data_uri;
        self.encrypted_key_for_gov = encrypted_key_for_gov;
        self.encrypted_key_for_user = encrypted_key_for_user;
        self.verification_status = VerificationStatus::Pending;
        self.verified_at = None;
        self.verified_by = None;
        self.role = role;
        self.created_at = timestamp;
        self.updated_at = timestamp;
        self.bump = bump;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum VerificationStatus {
    Pending,    // في انتظار التوثيق
    Verified,   // موثق
    Rejected,   // مرفوض
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum UserRoles {
   Normal,
   Inspector,
   ConfirmityExpert,
   Government   // الدور الحكومي للتحقق من المستخدمين
}