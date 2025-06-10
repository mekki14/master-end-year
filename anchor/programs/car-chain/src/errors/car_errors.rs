use anchor_lang::prelude::*;

// رسائل الخطأ
#[error_code]  
pub enum CarError {
    #[msg("غير مخول: فقط الحكومة يمكنها إنشاء سيارات")]
    UnauthorizedGovernment,
    #[msg("رقم الشاسيه غير صحيح - يجب أن يكون 17 حرف")]
    InvalidVin,
    #[msg("العلامة التجارية غير صحيحة")]
    InvalidBrand,
    #[msg("الطراز غير صحيح")]
    InvalidModel,
    #[msg("سنة الصنع غير صحيحة")]
    InvalidYear,
    #[msg("رقم المحرك غير صحيح")]
    InvalidEngineNumber,
    #[msg("السيارة غير معروضة للبيع")]
    CarNotForSale,
    #[msg("لا يمكنك شراء سيارتك الخاصة")]
    CannotBuyOwnCar,
    #[msg("طلب الشراء غير صالح")]
    InvalidBuyRequest,
    #[msg("حالة الطلب غير صالحة")]
    InvalidBuyRequestStatus,
    #[msg("غير مخول  : فقط المالك يمكن الوصول إلى هذه البيانات ")]
    UnauthorizedAccess,
    #[msg("السعر غير محدد")]
    SalePriceNotSet

}