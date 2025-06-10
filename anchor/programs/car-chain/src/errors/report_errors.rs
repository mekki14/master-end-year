use anchor_lang::prelude::*;

#[error_code]
pub enum CarReportError {
    #[msg("Invalid condition score - must be between 1 and 10")]
    InvalidConditionScore,

    #[msg("Notes are too long")]
    NotesTooLong,

    #[msg("Only authorized inspectors can create reports")]
    NotAuthorizedInspector,

    #[msg("Inspector must be verified to create reports")]
    InspectorNotVerified,
    #[msg("Report URI is too long - must be 256 characters or less")]
    UriTooLong,

    #[msg("Report summary is too long - must be 512 characters or less")]
    SummaryTooLong,
    #[msg("Invalid report - car mismatch")]
    InvalidReport,
}

#[error_code]
pub enum ConfirmityReportError {
    #[msg("Invalid report - car mismatch")]
    InvalidReport,
    #[msg("Not authorized: user is not a conformity expert")]
    NotAuthorizedConfirmityExpert,
    #[msg("Conformity expert is not verified")]
    ConfirmityExpertNotVerified,
    #[msg("Modifications field too long")]
    ModificationsTooLong,
    #[msg("Mines stamp field too long")]
    StampTooLong,
    #[msg("Notes field too long")]
    NotesTooLong,
}
