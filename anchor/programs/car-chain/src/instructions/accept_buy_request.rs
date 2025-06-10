use anchor_lang::prelude::*;
use crate::state::{BuyRequest, BuyRequestStatus, CarAccount, UserAccount, VerificationStatus};
use crate::errors::{CarError, CustomError};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(vin: String, buyer: Pubkey)]
pub struct AcceptBuyRequest<'info> {
    #[account(
        mut,
        seeds = [b"buy_request", vin.as_bytes(), buyer.as_ref()],
        bump,
        constraint = buy_request.status == BuyRequestStatus::Pending @ CarError::InvalidBuyRequestStatus,
        constraint = buy_request.seller == owner.key() @ CarError::UnauthorizedAccess,
    )]
    pub buy_request: Account<'info, BuyRequest>,

    #[account(
        mut,
        seeds = [b"car", GOVERNMENT_AUTHORITY.as_ref(), vin.as_bytes()],
        bump,
        constraint = car.owner == owner.key() @ CarError::UnauthorizedAccess,
        constraint = car.is_for_sale @ CarError::CarNotForSale,
    )]
    pub car: Account<'info, CarAccount>,

    #[account(
        seeds = [b"user", owner.key().as_ref(), owner_pda.user_name.as_bytes()],
        bump,
        constraint = owner_pda.verification_status == VerificationStatus::Verified @ CustomError::UserNotVerified
    )]
    pub owner_pda: Account<'info, UserAccount>,

    #[account(
        seeds = [b"user", buyer.as_ref(), buyer_pda.user_name.as_bytes()],
        bump,
        constraint = buyer_pda.verification_status == VerificationStatus::Verified @ CustomError::UserNotVerified
    )]
    pub buyer_pda: Account<'info, UserAccount>,

    /// CHECK: This is the current car owner
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is the buyer (for receiving payment)
    #[account(mut)]
    pub buyer_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AcceptBuyRequest>,
    vin: String,
    buyer: Pubkey,
) -> Result<()> {
    let buy_request = &mut ctx.accounts.buy_request;
    let car = &mut ctx.accounts.car;

    // Verify the buyer matches
    require!(buy_request.buyer == buyer, CarError::UnauthorizedAccess);

    // Transfer payment from buyer to owner
    let transfer_amount = buy_request.amount;
    
    **buy_request.to_account_info().try_borrow_mut_lamports()? -= transfer_amount;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += transfer_amount;

    // Transfer car ownership
    car.owner = buyer;
    car.is_for_sale = false;
    car.sale_price = None;

    // Update buy request status
    buy_request.status = BuyRequestStatus::Accepted;

    msg!("✅ Buy request accepted! Car {} transferred to {}", vin, buyer);
    msg!("💰 Payment of {} lamports transferred to owner", buy_request.amount);

    Ok(())
}
