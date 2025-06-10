use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid user name: must be between 1-50 characters")]
    InvalidUserName,
    
    #[msg("Unauthorized: only government can perform this action")]
    Unauthorized,
    
    #[msg("User is not verified")]
    UserNotVerified,
    
    #[msg("Car already exists")]
    CarAlreadyExists,
    
    #[msg("Car not found")]
    CarNotFound,

    #[msg("Unauthorized: only the designated minter can mint NFTs")]
    UnauthorizedMinter,
}


