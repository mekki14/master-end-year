use anchor_lang::prelude::*;


// استيراد الوحدات
pub mod instructions;
pub mod state;
pub mod errors;
pub mod utils;

// استيراد الدوال والهياكل
use instructions::*;
use state::*;
use errors::*;
use utils::*;

// Anchor discriminator size, that is needed to calculate the space required for the account.
const ANCHOR_DISCRIMINATOR: usize = 8;

declare_id!("2HSinCzB6rzm5auGRiguh84EwBK6HG8r96gJHAsNt9Lh");

#[program]
pub mod car_chain {
    use super::*;
    // 👤 دوال المستخدمين
    pub fn register_user(
        ctx: Context<RegisterUser>,
        user_name: String,
        public_data_uri: String,
        private_data_uri: String,
        encrypted_key_for_gov: String,
        encrypted_key_for_user: String,
        role: UserRoles,
    ) -> Result<()> {
        instructions::register_user::handler(
            ctx,
            user_name,
            public_data_uri,
            private_data_uri,
            encrypted_key_for_gov,
            encrypted_key_for_user,
            role,
        )
    }

    // ✅ دالة التحقق (جديدة)
    pub fn verify_user(
        ctx: Context<VerifyUser>,
        user_name: String,
        approve: bool,
    ) -> Result<()> {
        instructions::verify_user::handler(ctx, user_name, approve)
    }

    pub fn register_car(
        ctx: Context<RegisterCar>,
    car_id: String,
    vin: String,
    brand: String,
    model: String,
    year: u16,
    color: String,
    engine_number: String,
    owner: Pubkey,
    last_inspection_date: Option<i64>,
    inspection_status: InspectionStatus,
    latest_inspection_report: Option<String>,
    mileage: u32,
    bump: u8,
    ) -> Result<()> {
        instructions::register_car::handler(
            ctx,
            car_id,
            vin,
            brand,
            model,
            year,
            color,
            engine_number,
            owner,
            last_inspection_date,
            inspection_status,
            latest_inspection_report,
            mileage,
            bump
           
        )
  
}

    pub fn set_for_sale(
        ctx: Context<SetCarForSale>,
        vin: String,
        price: u64) -> Result<()> {
        instructions::set_for_sale::handler(ctx, vin, price)
    }
    pub fn cancel_for_sale(
        ctx: Context<CancelCarForSale>,
        vin: String) -> Result<()> {
        instructions::cancel_for_sale::handler(ctx, vin)
    }
    
    pub fn request_buy(
        ctx:Context<SendBuyRequest>, 
        vin: String, 
        message: Option<String>) -> Result<()> {
        instructions::request_buy::handler(ctx, vin, message)
    }

    pub fn accept_buy_request(
        ctx: Context<AcceptBuyRequest>,
        vin: String,
        buyer: Pubkey,
    ) -> Result<()> {
        instructions::accept_buy_request::handler(ctx, vin, buyer)

    }
    pub fn reject_buy_request(
        ctx: Context<RejectBuyRequest>,
        vin: String,
    ) -> Result<()> {
        instructions::reject_buy_request::handler(ctx, vin)

    }

    pub fn transfer_car(
        ctx: Context<TransferCar>,
        vin: String,
        user_name: String,
    ) -> Result<()> {
        instructions::transfer_car::handler(ctx,vin,user_name) 
    }

    pub fn issue_car_report(
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
        instructions::issue_car_report::handler(ctx,report_id,vin,overall_condition,engine_condition,body_condition,full_report_uri,report_summary,notes)
    }

    pub fn accept_report(
        ctx: Context<AcceptReport>,
        report_id: u64,
    ) -> Result<()> {
        instructions::accept_report::handler(ctx,report_id)
    }

    pub fn issue_confirmity_report(
        ctx: Context<IssueConformityReport>,
        report_id: u64,
        vin: String,
        conformity_status: bool,
        modifications: String,
        full_report_uri: String,
        mines_stamp: String,
        notes: String,
    ) -> Result<()> {
        instructions::issue_confirmity_report::handler(ctx,report_id,vin,conformity_status,modifications,full_report_uri,mines_stamp,notes)
    }
    pub fn accept_confirmity_report(
        ctx: Context<AcceptConfirmityReport>,
        report_id: u64,
    ) -> Result<()> {
        instructions::accept_confirmity_report::handler(ctx,report_id)
    }

    

}





