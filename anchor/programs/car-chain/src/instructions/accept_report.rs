use anchor_lang::prelude::*;

use anchor_lang::prelude::*;
use crate::{
    state::car_report::CarReport,
    state::car::CarAccount,
    state::user::{UserAccount, VerificationStatus, UserRoles},
    errors::CarReportError,
};

#[derive(Accounts)]
#[instruction(report_id: u64)]
pub struct AcceptReport<'info> {
    #[account(mut)]
    pub report: Account<'info, CarReport>,
    
    #[account(
        constraint = car.owner == owner.key(),
        has_one = owner
    )]
    pub car: Account<'info, CarAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>
}

pub fn handler(ctx: Context<AcceptReport>, report_id: u64) -> Result<()> {
    let report = &mut ctx.accounts.report;
    
    // Verify report belongs to the car
    require!(
        report.car == ctx.accounts.car.key(),
        CarReportError::InvalidReport
    );
    
    // Change report status to accepted
    report.approved_by_owner = true;
    
    Ok(())
}
