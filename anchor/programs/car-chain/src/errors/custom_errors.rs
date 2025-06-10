use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("المستخدم غير موجود")]
    UserNotFound,
    
    #[msg("تم معالجة هذا المستخدم مسبقاً")]
    UserAlreadyProcessed,
    
    #[msg("غير مخول للتحقق من المستخدمين")]
    UnauthorizedVerifier,
    
    #[msg("حالة المستخدم غير صالحة")]
    InvalidUserStatus,
    
    #[msg("معرف المستخدم موجود مسبقاً")]
    UserIdAlreadyExists,
    
    #[msg("بيانات المستخدم غير صالحة")]
    InvalidUserData,
    #[msg("Unauthorized: only the owner can update the user")]
    NotCarOwner,
    #[msg("المستخدم غير موثق")]
    UserNotVerified,
}
