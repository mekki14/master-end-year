// instruction/verify.rs
use anchor_lang::prelude::*;
use crate::{
    state::user::{UserAccount, VerificationStatus},
    errors::CustomError,
};
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(user_name: String)]
pub struct VerifyUser<'info> {
    // 👥 حساب المستخدم المراد التحقق منه
    #[account(
        mut,
        seeds = [
            b"user", 
            user_account.authority.key().as_ref(),
        user_name.as_bytes(),
        ],
        bump = user_account.bump,
        constraint = user_account.verification_status == VerificationStatus::Pending @ CustomError::UserAlreadyProcessed
    )]
    pub user_account: Account<'info, UserAccount>,
    
    // 🏛️ المحفظة الحكومية المخولة
    #[account(
        constraint = government.key() == GOVERNMENT_AUTHORITY @ CustomError::UnauthorizedVerifier
    )]
    pub government: Signer<'info>,
}

// 📋 دالة التحقق من المستخدم
pub fn handler(
    ctx: Context<VerifyUser>,
    user_name: String,      // نحتاجه للـ seeds
    approve: bool,         // true = موافقة، false = رفض
) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    let government_key = ctx.accounts.government.key();
    let clock = Clock::get()?;

   
    // ⚡ تحديث حالة المستخدم
    if approve {
        // ✅ الموافقة على المستخدم
        user_account.verification_status = VerificationStatus::Verified;
        user_account.verified_at = Some(clock.unix_timestamp);
        user_account.verified_by = Some(government_key);
        
        msg!("✅ تم توثيق المستخدم: {}", user_account.user_name);
        
    } else {
        // ❌ رفض المستخدم
        user_account.verification_status = VerificationStatus::Rejected;
        user_account.verified_at = Some(clock.unix_timestamp);
        user_account.verified_by = Some(government_key);
        
        msg!("❌ تم رفض المستخدم: {}", user_account.user_name);
    }



    Ok(())
}

