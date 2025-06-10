use anchor_lang::prelude::*;
use crate::{
    state::car::{CarAccount},
    errors::CustomError,
};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(vin: String)]
pub struct CancelCarForSale<'info> {
    // The car account to remove from sale
    #[account(
        mut,
        seeds = [
            b"car",
            GOVERNMENT_AUTHORITY.as_ref(),
            vin.as_bytes()
        ],
        bump
    )]
    pub car_account: Account<'info, CarAccount>,
    
    // The owner of the car
    #[account(
        mut,
        constraint = owner.key() == car_account.owner @ CustomError::NotCarOwner
    )]
    pub owner: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CancelCarForSale>,
    vin: String,
) -> Result<()> {
    let car_account = &mut ctx.accounts.car_account;
    
    // Remove car from sale
    car_account.is_for_sale = false;
    car_account.sale_price = None;
    
    msg!("Car {} has been removed from sale", vin);

    Ok(())
}
