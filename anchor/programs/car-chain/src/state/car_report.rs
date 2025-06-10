use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct CarReport {
    // Basic car info
    pub report_id: u64,
    pub car: Pubkey,
    pub inspector: Pubkey,
    pub car_owner: Pubkey,
    pub report_date: i64,
    
    // Condition ratings
    pub overall_condition: u8, // Scale 1-10
    pub engine_condition: u8,  // Scale 1-10
    pub body_condition: u8,    // Scale 1-10
    
    // Report details
    pub full_report_uri: String,
    pub report_summary: String,
    
    // Approval status
    pub approved_by_owner: bool,
    
    // Additional info
    pub notes: String,
    
    // Space for future extensions
    pub bump: u8,
}

impl CarReport {
    pub const MAXIMUM_SIZE: usize = 32 + // car pubkey
        32 + // inspector pubkey
        32 + // car_owner pubkey
        8 +  // report_date
        1 +  // overall_condition
        1 +  // engine_condition
        1 +  // body_condition
        256 + // full_report_uri (String)
        256 + // report_summary (String)
        1 +   // approved_by_owner
        200 + // notes
        1;    // bump
    pub const MAX_NOTES_LENGTH: usize = 200;
}
