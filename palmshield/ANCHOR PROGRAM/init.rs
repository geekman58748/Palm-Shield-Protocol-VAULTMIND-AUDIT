use anchor_lang::prelude::*;

declare_id!("ReInitXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// ============================================================
// STRESS TEST — V06: Account Reinitialization
// Submitted as part of PalmShield adversarial audit for VaultMind.
//
// Bug: register_sentinel uses init_if_needed without checking
// whether the account was already initialized. Any caller can
// overwrite the authority field of an existing registry entry,
// permanently hijacking ownership of that sentinel record.
//
// Expected VaultMind behavior: FLAG this instruction under V06.
// ============================================================

#[program]
pub mod v06_reinitialization {
    use super::*;

    pub fn register_sentinel(
        ctx: Context<RegisterSentinel>,
        sentinel_id: String,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.sentinel_registry;

        // V06 BUG: Missing is_initialized check.
        // A second caller can re-invoke this with the same sentinel_id
        // and overwrite the authority field with their own pubkey.
        //
        // Fix:
        //   require!(!registry.is_initialized, ErrorCode::AlreadyInitialized);

        registry.authority      = ctx.accounts.caller.key();
        registry.sentinel_id    = sentinel_id;
        registry.is_initialized = true;
        registry.created_at     = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(sentinel_id: String)]
pub struct RegisterSentinel<'info> {
    #[account(
        init_if_needed,       // V06: this is the footgun — allows reinitialization
        payer = caller,
        space = 8 + 32 + 64 + 1 + 8,
        seeds = [b"sentinel", sentinel_id.as_bytes()],
        bump
    )]
    pub sentinel_registry: Account<'info, SentinelRegistry>,

    #[account(mut)]
    pub caller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct SentinelRegistry {
    pub authority:      Pubkey,
    pub sentinel_id:    String,
    pub is_initialized: bool,
    pub created_at:     i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Account already initialized — authority cannot be overwritten")]
    AlreadyInitialized,
}
