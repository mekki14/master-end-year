use anchor_lang::prelude::*;

use crate::{
    state::confirmity_report::ConformityReport,
    state::car::CarAccount,
    state::user::{UserAccount, VerificationStatus, UserRoles},
    errors::ConfirmityReportError,
};

#[derive(Accounts)]
#[instruction(report_id: u64)]
pub struct AcceptConfirmityReport<'info> {
    #[account(mut)]
    pub conformity_report: Account<'info, ConformityReport>,
    
    #[account(
        constraint = car.owner == owner.key(),
        has_one = owner
    )]
    pub car: Account<'info, CarAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>
}

pub fn handler(ctx: Context<AcceptConfirmityReport>, report_id: u64) -> Result<()> {
    let report = &mut ctx.accounts.conformity_report;
    
    // Verify report belongs to the car
    require!(
        report.car == ctx.accounts.car.key(),
        ConfirmityReportError::InvalidReport
    );
    
    // Change report status to accepted
    report.accepted_by_owner = true;
    
    Ok(())
} 