use anchor_lang::prelude::*;
use crate::{
    state::confirmity_report::ConformityReport,
    state::car::CarAccount,
    state::user::{UserAccount, VerificationStatus, UserRoles},
    errors::ConfirmityReportError,
};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(report_id: u64, vin: String)]
pub struct IssueConformityReport<'info> {
    #[account(
        init,
        payer = confirmity_expert_signer,
        space = 8 + // Discriminator
            32 + // car: Pubkey
            32 + // confirmity_expert: Pubkey
            32 + // car_owner: Pubkey
            8 + // inspection_date: i64
            1 + // conformity_status: bool
            256 + // modifications: String (max 256 bytes)
            256 + // confirmity_expert_signature: String (max 256 bytes)
            256 + // mines_stamp: String (max 256 bytes)
            512 + // notes: String (max 512 bytes)
            1, // bump: u8
        seeds = [
            b"conformity_report",
            car.key().as_ref(),
            confirmity_expert_signer.key().as_ref(),
            &report_id.to_le_bytes()
        ],
        bump 
    )]
    pub conformity_report: Account<'info, ConformityReport>,

    #[account(mut,
        seeds = [b"car", GOVERNMENT_AUTHORITY.as_ref(), vin.as_bytes()],
        bump = car.bump,
    )]
    pub car: Account<'info, CarAccount>,

    #[account(
        constraint = confirmity_expert.role == UserRoles::ConfirmityExpert @ ConfirmityReportError::NotAuthorizedConfirmityExpert,
        constraint = confirmity_expert.verification_status == VerificationStatus::Verified @ ConfirmityReportError::ConfirmityExpertNotVerified
    )]
    pub confirmity_expert: Account<'info, UserAccount>,

    #[account(mut)]
    pub confirmity_expert_signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<IssueConformityReport>,
    report_id: u64,
    vin: String,
    conformity_status: bool,
    modifications: String,
    full_report_uri: String,
    mines_stamp: String,
    notes: String,
) -> Result<()> {
    require!(modifications.len() <= 256, ConfirmityReportError::ModificationsTooLong);
    require!(mines_stamp.len() <= 256, ConfirmityReportError::StampTooLong);
    require!(notes.len() <= ConformityReport::MAX_NOTES_LENGTH, ConfirmityReportError::NotesTooLong);

    let car = &ctx.accounts.car;
    let confirmity_expert = &ctx.accounts.confirmity_expert;
    let report = &mut ctx.accounts.conformity_report;

    require!(confirmity_expert.role == UserRoles::ConfirmityExpert, ConfirmityReportError::NotAuthorizedConfirmityExpert);
    require!(confirmity_expert.verification_status == VerificationStatus::Verified, ConfirmityReportError::ConfirmityExpertNotVerified);

    report.report_id = report_id;
    report.car = car.key();
    report.confirmity_expert = confirmity_expert.key();
    report.car_owner = car.owner;
    report.report_date = Clock::get()?.unix_timestamp;
    report.conformity_status = conformity_status;
    report.modifications = modifications;
    report.full_report_uri = full_report_uri;
    report.mines_stamp = mines_stamp;
    report.accepted_by_owner = false;
    report.notes = notes;
    report.bump = ctx.bumps.conformity_report;

    msg!("New car conformity report created for VIN: {}", vin);

    Ok(())
}
