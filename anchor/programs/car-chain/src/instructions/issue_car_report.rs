use anchor_lang::prelude::*;
use crate::{
    state::car_report::CarReport,
    state::car::CarAccount,
    state::user::{UserAccount, VerificationStatus, UserRoles},
    errors::CarReportError,
};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(report_id: u64, vin: String)]
pub struct IssueCarReport<'info> {
    #[account(
        init,
        payer = inspector_signer,
        space = 8 + // Discriminator
            32 + // car: Pubkey
            32 + // inspector: Pubkey
            32 + // car_owner: Pubkey
            8 + // report_date: i64
            1 + // overall_condition: u8
            1 + // engine_condition: u8
            1 + // body_condition: u8
            256 + // full_report_uri: String (max 256 bytes)
            512 + // report_summary: String (max 512 bytes)
            1 + // approved_by_owner: bool
            512 + // notes: String (max 512 bytes)
            1, // bump: u8
        seeds = [
            b"car_report",
            car.key().as_ref(),
            inspector_signer.key().as_ref(),
            &report_id.to_le_bytes()
        ],
        bump 
    )]
    pub car_report: Account<'info, CarReport>,

    #[account(mut,
        seeds = [b"car", GOVERNMENT_AUTHORITY.as_ref(), vin.as_bytes()],
        bump = car.bump,
    )]
    pub car: Account<'info, CarAccount>,

    #[account(
        constraint = inspector.role == UserRoles::Inspector @ CarReportError::NotAuthorizedInspector,
        constraint = inspector.verification_status == VerificationStatus::Verified @ CarReportError::InspectorNotVerified
    )]
    pub inspector: Account<'info, UserAccount>,

    #[account(mut)]
    pub inspector_signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<IssueCarReport>,
    report_id: u64,
    vin: String,
    overall_condition: u8,
    engine_condition: u8,
    body_condition: u8,
    full_report_uri: String,
    report_summary: String,
    notes: String,
) -> Result<()> {
    // التحقق من صحة البيانات
    require!(overall_condition >= 1 && overall_condition <= 10, CarReportError::InvalidConditionScore);
    require!(engine_condition >= 1 && engine_condition <= 10, CarReportError::InvalidConditionScore);
    require!(body_condition >= 1 && body_condition <= 10, CarReportError::InvalidConditionScore);
    require!(notes.len() <= CarReport::MAX_NOTES_LENGTH, CarReportError::NotesTooLong);
    require!(full_report_uri.len() <= 256, CarReportError::UriTooLong);
    require!(report_summary.len() <= 512, CarReportError::SummaryTooLong);

    let car = &ctx.accounts.car;
    let inspector = &ctx.accounts.inspector;
    let report = &mut ctx.accounts.car_report;

    // التحقق من أن المفتش معتمد
    require!(inspector.role == UserRoles::Inspector, CarReportError::NotAuthorizedInspector);
    require!(inspector.verification_status == VerificationStatus::Verified, CarReportError::InspectorNotVerified);

    // ملء بيانات التقرير
    report.report_id = report_id;
    report.car = car.key();
    report.inspector = inspector.key();
    report.car_owner = car.owner;
    report.report_date = Clock::get()?.unix_timestamp;
    report.overall_condition = overall_condition;
    report.engine_condition = engine_condition;
    report.body_condition = body_condition;
    report.full_report_uri = full_report_uri;
    report.report_summary = report_summary;
    report.approved_by_owner = false; // يحتاج موافقة المالك
    report.notes = notes;
    report.bump = ctx.bumps.car_report;

    msg!("New car inspection report created for car: {}", car.key());

    Ok(())
}
