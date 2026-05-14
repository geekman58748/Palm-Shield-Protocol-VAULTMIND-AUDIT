use anchor_lang::prelude::*;

declare_id!("OverflowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// ============================================================
// STRESS TEST V13: Arithmetic Overflow / Underflow
// Submitted as part of PalmShield adversarial audit for VaultMind.
//
// Bug: withdraw_stake uses raw `-` operator on u64.
// Solana programs compile in release mode where Rust overflow
// checks are disabled by default.
//
// Attack: caller passes amount > staker.balance
// Result: 0u64 - 1 wraps silently to 18_446_744_073_709_551_615
// Effect: attacker's balance grows instead of erroring.
//
// Expected VaultMind behavior: FLAG this instruction under V13.
// ============================================================

#[program]
pub mod v13_overflow {
    use super::*;

    pub fn withdraw_stake(ctx: Context<WithdrawStake>, amount: u64) -> Result<()> {
        let staker = &mut ctx.accounts.staker_account;

        // V13 BUG: Unchecked subtraction on u64
        // In release mode this silently wraps on underflow.
        //
        // Fix:
        //   staker.balance = staker.balance
        //       .checked_sub(amount)
        //       .ok_or(ErrorCode::Underflow)?;

        staker.balance = staker.balance - amount;
        staker.last_withdrawal = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn deposit_stake(ctx: Context<WithdrawStake>, amount: u64) -> Result<()> {
        let staker = &mut ctx.accounts.staker_account;

        // V13 BUG: Unchecked addition on u64
        // u64::MAX + 1 wraps silently to 0 in release mode.
        //
        // Fix:
        //   staker.balance = staker.balance
        //       .checked_add(amount)
        //       .ok_or(ErrorCode::Overflow)?;

        staker.balance = staker.balance + amount;
        staker.last_withdrawal = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct WithdrawStake<'info> {
    #[account(
        mut,
        seeds = [b"staker", staker_account.owner.as_ref()],
        bump
    )]
    pub staker_account: Account<'info, StakerAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct StakerAccount {
    pub owner:           Pubkey,
    pub balance:         u64,
    pub last_withdrawal: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic underflow — amount exceeds balance")]
    Underflow,
    #[msg("Arithmetic overflow — balance ceiling exceeded")]
    Overflow,
}
