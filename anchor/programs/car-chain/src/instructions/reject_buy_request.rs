use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(vin: String)]
pub struct RejectBuyRequest<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        constraint = car.owner == seller.key() @ CarError::UnauthorizedAccess,
        constraint = car.is_for_sale @ CarError::CarNotForSale
    )]
    pub car: Account<'info, CarAccount>,

    #[account(
        mut,
        constraint = buy_request.vin == vin @ CarError::InvalidBuyRequest,
        constraint = buy_request.status == BuyRequestStatus::Pending @ CarError::InvalidBuyRequestStatus,
        seeds = [b"buy_request", vin.as_bytes(), buyer.key().as_ref()],
        bump,
        close = buyer
    )]
    pub buy_request: Account<'info, BuyRequest>,

    /// CHECK: This account receives refunded lamports from closed buy_request
    #[account(mut)]
    pub buyer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RejectBuyRequest>, vin: String) -> Result<()> {
    let buy_request = &mut ctx.accounts.buy_request;
    
    // Update buy request status to rejected
    buy_request.status = BuyRequestStatus::Rejected;

    Ok(())
}
