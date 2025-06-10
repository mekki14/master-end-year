use anchor_lang::prelude::*;
use crate::state::{UserAccount, UserRoles, VerificationStatus};
use crate::errors::ErrorCode;

use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(user_name: String, public_data_uri: String, private_data_uri: String, encrypted_key_for_gov: String, encrypted_key_for_user: String, role: UserRoles)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = user_signer,
        space = UserAccount::LEN,
        seeds = [
            b"user",
            user_signer.key().as_ref(),
            user_name.as_bytes()
        ],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub user_signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterUser>,
    user_name: String,
    public_data_uri: String,
    private_data_uri: String,
    encrypted_key_for_gov: String,
    encrypted_key_for_user: String,
    role: UserRoles
) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    let clock = Clock::get()?;
    
    // التحقق من صحة البيانات
    require!(
        !user_name.is_empty() && user_name.len() <= 50, 
        ErrorCode::InvalidUserName
    );
    
    user_account.authority = ctx.accounts.user_signer.key();
    user_account.user_name = user_name;
    user_account.public_data_uri = public_data_uri;
    user_account.private_data_uri = private_data_uri;
    user_account.encrypted_key_for_gov = encrypted_key_for_gov;
    user_account.encrypted_key_for_user = encrypted_key_for_user;
    user_account.role = role;
    user_account.verification_status = VerificationStatus::Pending;
    user_account.verified_at = None;
    user_account.verified_by = None;
    user_account.created_at = clock.unix_timestamp;
    user_account.updated_at = clock.unix_timestamp;
    user_account.bump = ctx.bumps.user_account;
    msg!("✅ تم تسجيل مستخدم جديد: {}", user_account.user_name);
    
    Ok(())
}
