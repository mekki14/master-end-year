use anchor_lang::prelude::*;
use crate::state::{BuyRequest, BuyRequestStatus, CarAccount, UserAccount, VerificationStatus};
use crate::errors::{CarError, CustomError};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(vin: String,user_name: String)]
pub struct TransferCar<'info> {
    #[account(mut,
        seeds = [b"car", GOVERNMENT_AUTHORITY.as_ref(), vin.as_bytes()],
        bump = car.bump,
    )]
    pub car: Account<'info, CarAccount>,
    
    #[account(mut)]
    pub current_owner: Signer<'info>,
    
    #[account(mut)]
    pub new_owner: Signer<'info>,
    #[account(mut
    , seeds = [
        b"user",
        new_owner.key().as_ref(),
        user_name.as_bytes().as_ref(),
    ]
    , bump)]
    pub new_owner_pda: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<TransferCar>, vin: String,user_name: String) -> Result<()> {
    let car = &mut ctx.accounts.car;
    
    // Verify the current owner
    require!(
        car.owner == ctx.accounts.current_owner.key(),
        CarError::UnauthorizedAccess
    );
    // Get the PDA account for the new owner
   
    require!(
        ctx.accounts.new_owner_pda.verification_status == VerificationStatus::Verified,
        CustomError::UserNotVerified
    );
    // Transfer ownership
    car.owner = ctx.accounts.new_owner.key();

    msg!("Car with VIN {} has been transferred to {}", vin, car.owner);

    Ok(())
}



