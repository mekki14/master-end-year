use anchor_lang::prelude::*;
use crate::state::{BuyRequest, BuyRequestStatus, CarAccount, UserAccount, VerificationStatus };
use crate::errors::CarError;
use crate::errors::CustomError;
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(vin: String)]
pub struct SendBuyRequest<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 32 + 8 + 4 + 200 + 1, // Discriminator + vin + buyer + owner + amount + msg_len + msg + status
        seeds = [b"buy_request", vin.as_bytes(), buyer.key().as_ref()],
        bump,
    )]
    pub buy_request: Account<'info, BuyRequest>,
    
    #[account(
        seeds = [b"car", GOVERNMENT_AUTHORITY.as_ref(), vin.as_bytes()],
        bump,
        constraint = car.is_for_sale @ CarError::CarNotForSale,
        constraint = car.sale_price.is_some() @ CarError::SalePriceNotSet,
    )]
    pub car: Account<'info, CarAccount>,
    
    #[account(
        seeds = [b"user", buyer.key().as_ref(), buyer_pda.user_name.as_bytes()],
        bump,
        constraint = buyer_pda.verification_status == VerificationStatus::Verified @ CustomError::UserNotVerified
    )]
    pub buyer_pda: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SendBuyRequest>,
    vin: String,
    message: Option<String>,
) -> Result<()> {
    let car = &ctx.accounts.car;
    let buy_request = &mut ctx.accounts.buy_request;
    
    // Get the sale price and ensure it exists
    let transfer_amount = car.sale_price.ok_or(CarError::SalePriceNotSet)?;
    
    // Ensure buyer is not trying to buy their own car
    require!(ctx.accounts.buyer.key() != car.owner, CarError::CannotBuyOwnCar);
    
    // Initialize the buy request
    buy_request.initialize(
        vin.clone(),
        ctx.accounts.buyer.key(),
        car.owner,
        transfer_amount,
        message,
    )?;


    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.buy_request.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, transfer_amount)?;
    
    msg!("📝 New buy request for car {} with price {} lamports", vin, transfer_amount);
    
    Ok(())
}
