use anchor_lang::prelude::*;

#[account]
pub struct CarAccount {
    pub car_id: String,
    pub vin: String,
    pub brand: String,
    pub model: String,
    pub year: u16,
    pub color: String,
    pub engine_number: String,
    pub owner: Pubkey,
    pub registered_by: Pubkey,
    pub registration_date: Option<i64>,
    pub is_active: bool,
    pub transfer_count: u32,
    pub last_inspection_date: Option<i64>,
    pub inspection_status: InspectionStatus,
    pub latest_inspection_report: Option<String>,
    pub mileage: u32,
    pub is_for_sale: bool,
    pub sale_price: Option<u64>,
    pub bump: u8,
}

impl CarAccount {
    // Define max lengths for string fields
    const MAX_ID_LEN: usize = 50;
    const MAX_VIN_LEN: usize = 17;
    const MAX_BRAND_LEN: usize = 50;
    const MAX_MODEL_LEN: usize = 50;
    const MAX_COLOR_LEN: usize = 20;
    const MAX_ENGINE_NUMBER_LEN: usize = 50;
    const MAX_INSPECTION_REPORT_LEN: usize = 200;

    pub const LEN: usize = 8 + // discriminator
        (4 + Self::MAX_ID_LEN) + // id (String)
        (4 + Self::MAX_VIN_LEN) + // vin (String)
        (4 + Self::MAX_BRAND_LEN) + // brand (String)
        (4 + Self::MAX_MODEL_LEN) + // model (String)
        2 + // year (u16)
        (4 + Self::MAX_COLOR_LEN) + // color (String)
        (4 + Self::MAX_ENGINE_NUMBER_LEN) + // engine_number (String)
        32 + // owner (Pubkey)
        32 + // registered_by (Pubkey)
        8 + // registration_date (i64)
        1 + // is_active (bool)
        4 + // transfer_count (u32)
        8 + // last_inspection_date (i64)
        1 + // inspection_status (InspectionStatus enum - 1 byte)
        (4 + Self::MAX_INSPECTION_REPORT_LEN) + // latest_inspection_report (String)
        4 + // mileage (u32)
        1 + // is_for_sale (bool)
        9 + // sale_price (Option<u64>)
        1; // bump (u8)

    pub fn initialize(
        &mut self,
        car_id: String,
        vin: String,
        brand: String,
        model: String,
        year: u16,
        color: String,
        engine_number: String,
        owner: Pubkey,
        registered_by: Pubkey,
        registration_date: Option<i64>,
        last_inspection_date: Option<i64>,
        inspection_status: InspectionStatus,
        latest_inspection_report: Option<String>,
        mileage: u32,
        bump: u8,
    ) -> Result<()> {
        self.car_id = car_id;
        self.vin = vin;
        self.brand = brand;
        self.model = model;
        self.year = year;
        self.color = color;
        self.engine_number = engine_number;
        self.owner = owner;
        self.registered_by = registered_by;
        self.registration_date = registration_date;
        self.is_active = true;
        self.transfer_count = 0;
        self.last_inspection_date = last_inspection_date;
        self.inspection_status = inspection_status;
        self.latest_inspection_report = latest_inspection_report;
        self.mileage = mileage;
        self.is_for_sale = false;
        self.sale_price = None;
        self.bump = bump;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum InspectionStatus {
    Pending,
    Passed,
    Failed,
    Expired
}