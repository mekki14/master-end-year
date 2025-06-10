use anchor_lang::prelude::*;
use crate::{
    state::car::{CarAccount},
    errors::CustomError,
};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(vin: String, price: u64)]
pub struct SetCarForSale<'info> {
    // The car account to be put up for sale
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
    ctx: Context<SetCarForSale>,
    vin: String,
    price: u64,
) -> Result<()> {
    let car_account = &mut ctx.accounts.car_account;
    
    // Update car sale status and price
    car_account.is_for_sale = true;
    car_account.sale_price = Some(price);
    
    msg!("Car {} has been set for sale at {} lamports", vin, price);

    Ok(())
}
