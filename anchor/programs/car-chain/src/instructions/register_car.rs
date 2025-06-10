use anchor_lang::prelude::*;
use crate::state::{CarAccount,InspectionStatus };
use crate::errors::CarError;
use crate::errors::CustomError;
use crate::utils::constants::GOVERNMENT_AUTHORITY;

#[derive(Accounts)]
#[instruction(car_id: String, vin: String)]
pub struct RegisterCar<'info> {
    #[account(
        init,
        payer = government,
        space = CarAccount::LEN,
        seeds = [
            b"car",
            government.key().as_ref(),
            vin.as_bytes()
        ],
        bump
    )]
    pub car: Account<'info, CarAccount>,
    
    #[account(
        mut,
        constraint = government.key() == GOVERNMENT_AUTHORITY @ CustomError::UnauthorizedVerifier
    )]
    pub government: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
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

    // التحقق من صحة البيانات
    require!(!vin.is_empty() && vin.len() == 17, CarError::InvalidVin);
    require!(!brand.is_empty() && brand.len() <= 30, CarError::InvalidBrand);
    require!(!model.is_empty() && model.len() <= 30, CarError::InvalidModel);
    require!(year >= 1900 && year <= 2025, CarError::InvalidYear);
    require!(!engine_number.is_empty(), CarError::InvalidEngineNumber);

    let car = &mut ctx.accounts.car;
    let clock = Clock::get()?;

    // تعبئة بيانات السيارة
    car.car_id = car_id;
    car.vin = vin;
    car.brand = brand;
    car.model = model;  
    car.year = year;
    car.color = color;
    car.engine_number = engine_number;
    car.owner = owner;
    car.registered_by = ctx.accounts.government.key();
    car.registration_date = Some(clock.unix_timestamp);
    car.is_active = true;
    car.transfer_count = 0;
    car.last_inspection_date = last_inspection_date;
    car.inspection_status=inspection_status;
    car.latest_inspection_report=latest_inspection_report;
    car.mileage = mileage;
    car.is_for_sale = false;
    car.sale_price = None;
    car.bump = ctx.bumps.car;

    msg!("سيارة جديدة تم إنشاؤها: ID {}, VIN: {}, المالك: {}", car.car_id, car.vin, owner);

    Ok(())
}



#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum InspectionType {
    Periodic,     // فحص دوري
    PreSale,      // فحص ما قبل البيع
    PostAccident, // فحص ما بعد الحادث
    Custom,       // فحص مخصص
}