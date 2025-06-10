use anchor_lang::prelude::*;


#[account]
pub struct BuyRequest {
    pub vin: String,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub status: BuyRequestStatus, // Pending, Approved, Rejected
    pub created_at: i64,
    pub message: Option<String>,
}

impl BuyRequest {
    pub fn initialize(
        &mut self,
        vin: String,
        buyer: Pubkey,
        seller: Pubkey,
        amount: u64,
        message: Option<String>,
    ) -> Result<()> {
        self.vin = vin;
        self.buyer = buyer;
        self.seller = seller;
        self.amount = amount;
        self.status = BuyRequestStatus::Pending;
        self.created_at = Clock::get()?.unix_timestamp;
        self.message = message;
        Ok(())
    }
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BuyRequestStatus {
    Pending,
    Accepted,
    Rejected,
}
