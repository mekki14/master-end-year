use anchor_lang::prelude::*;

#[account]
pub struct ConformityReport {
    pub report_id:u64 ,
    pub car: Pubkey,
    pub confirmity_expert: Pubkey,
    pub car_owner: Pubkey,
    pub report_date: i64,
    pub conformity_status: bool,
    pub modifications: String,
    pub mines_stamp: String,
    pub full_report_uri: String,
    pub accepted_by_owner: bool,
    pub notes: String,
    pub bump: u8,
}

impl ConformityReport {
    pub const MAX_NOTES_LENGTH: usize = 512;
    pub const MAXIMUM_SIZE: usize = 8 + // discriminator
        64 + // reportId
        32 + // car
        32 + // confirmity_expert
        32 + // car_owner
        8 +  // report_date
        1 +  // conformity_status
        4 + 256 + // modifications (string prefix + max bytes)
        4 + 256 + // mines_stamp (string prefix + max bytes)
        4 + 256 + // full_report_uri (string prefix + max bytes)
        1 +  // accepted_by_owner
        4 + 512 + // notes (string prefix + max bytes)
        1;   // bump
}
