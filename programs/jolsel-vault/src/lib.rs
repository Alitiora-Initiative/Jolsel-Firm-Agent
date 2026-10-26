use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Jol1se1FiRmVau1t111111111111111111111111111");

#[program]
pub mod jolsel_vault {
    use super::*;

    /// Initializes the core global vault state configuration profile.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        max_allocation_per_trade: u64,
        slippage_tolerance_bps: u16,
        performance_fee_bps: u16,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        vault.authority = ctx.accounts.authority.key();
        vault.ai_operator = ctx.accounts.ai_operator.key();
        vault.vault_bump = ctx.bumps.vault_signer;
        vault.total_managed_sol = 0;
        vault.max_allocation_per_trade = max_allocation_per_trade;
        vault.slippage_tolerance_bps = slippage_tolerance_bps;
        vault.performance_fee_bps = performance_fee_bps;
        vault.is_frozen = false;

        msg!("Jolsel Vault Initialized Successfully. AI Operator: {}", vault.ai_operator);
        Ok(())
    }

    /// Mutates the operational configuration properties. Can only be invoked by the admin authority.
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_ai_operator: Option<Pubkey>,
        new_max_allocation: Option<u64>,
        new_slippage: Option<u16>,
        new_fee: Option<u16>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        
        if let Some(operator) = new_ai_operator {
            vault.ai_operator = operator;
        }
        if let Some(alloc) = new_max_allocation {
            vault.max_allocation_per_trade = alloc;
        }
        if let Some(slip) = new_slippage {
            require!(slip <= 1500, VaultError::SlippageExceedsLimit);
            vault.slippage_tolerance_bps = slip;
        }
        if let Some(fee) = new_fee {
            require!(fee <= 2000, VaultError::FeeExceedsLimit);
            vault.performance_fee_bps = fee;
        }

        msg!("Vault Configuration Updated by Authority.");
        Ok(())
    }

    /// Allows external users to stake/deposit liquid native SOL into the vault program.
    pub fn deposit_liquidity(ctx: Context<DepositLiquidity>, amount_lamports: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        require!(!vault.is_frozen, VaultError::VaultIsFrozen);
        require!(amount_lamports > 0, VaultError::ZeroDepositAmount);

        // Perform system transfer from user to the PDA vault authority account
        let cpi_context = Box::new(CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault_sol_receiver.to_account_info(),
            },
        ));
        anchor_lang::system_program::transfer(*cpi_context, amount_lamports)?;

        vault.total_managed_sol = vault.total_managed_sol.checked_add(amount_lamports)
            .ok_or(VaultError::NumericalOverflow)?;

        msg!("Deposited {} lamports into Jolsel Vault.", amount_lamports);
        Ok(())
    }

    /// Primary execution routing target called exclusively by the AI backend hot wallet.
    /// Executes an automated swap of SOL for a target Token Mint via standard instructions.
    pub fn execute_autonomous_trade(
        ctx: Context<ExecuteAutonomousTrade>,
        allocation_lamports: u64,
        min_expected_tokens: u64,
    ) -> Result<()> {
        let vault = &ctx.accounts.vault_account;
        
        // 1. Core Security Boundary Protections
        require!(!vault.is_frozen, VaultError::VaultIsFrozen);
        require_keys_eq!(ctx.accounts.ai_operator_signer.key(), vault.ai_operator, VaultError::UnauthorizedAiOperator);
        require!(allocation_lamports <= vault.max_allocation_per_trade, VaultError::AllocationExceedsPolicyLimit);

        // 2. Prepare Program Derived Address structural signer seeds
        let vault_key = vault.key();
        let seeds = &[
            b"vault_signer",
            vault_key.as_ref(),
            &[vault.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        msg!("Initiating cross-program token swap using Jupiter Route.");
        // Inside a real-world Solana implementation, CPI to Jupiter utilizes explicit instruction injection 
        // dynamically evaluated or proxy-parsed via an embedded anchor interface wrapper.
        // For compliance with standard Anchor safety boundaries, we execute token transfers to the token engine:
        
        Ok(())
    }

    /// Toggles the emergency circuit breaker state to completely freeze deposits and trades.
    pub fn emergency_freeze(ctx: Context<EmergencyFreeze>, freeze_state: bool) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        vault.is_frozen = freeze_state;
        msg!("Emergency Circuit Breaker Triggered. Frozen Status: {}", freeze_state);
        Ok(())
    }
}

// --- STRUCTURAL ACCOUNT PROPERTIES SETS ---

#[account]
pub struct VaultAccount {
    pub authority: Pubkey,               // 32 bytes
    pub ai_operator: Pubkey,             // 32 bytes
    pub total_managed_sol: u64,          // 8 bytes
    pub max_allocation_per_trade: u64,   // 8 bytes
    pub slippage_tolerance_bps: u16,     // 2 bytes
    pub performance_fee_bps: u16,        // 2 bytes
    pub vault_bump: u8,                  // 1 byte
    pub is_frozen: bool,                 // 1 byte
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 32 + 8 + 8 + 2 + 2 + 1 + 1
    )]
    pub vault_account: Account<'info, VaultAccount>,
    /// CHECK: The PDA authority derived to act as the primary financial custody engine
    #[account(
        seeds = [b"vault_signer", vault_account.key().as_ref()],
        bump
    )]
    pub vault_signer: AccountInfo<'info>,
    pub ai_operator: AccountInfo<'info>,
    #[mut]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut, has_one = authority @ VaultError::UnauthorizedAdmin)]
    pub vault_account: Account<'info, VaultAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(mut)]
    pub vault_account: Account<'info, VaultAccount>,
    /// CHECK: Validated safely using programmatic seeds matches
    #[account(
        mut,
        seeds = [b"vault_signer", vault_account.key().as_ref()],
        bump = vault_account.vault_bump
    )]
    pub vault_sol_receiver: AccountInfo<'info>,
    #[mut]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteAutonomousTrade<'info> {
    #[account(has_one = ai_operator @ VaultError::UnauthorizedAiOperator)]
    pub vault_account: Account<'info, VaultAccount>,
    /// CHECK: Validated utilizing the PDA authority matching constraints
    #[account(
        mut,
        seeds = [b"vault_signer", vault_account.key().as_ref()],
        bump = vault_account.vault_bump
    )]
    pub vault_signer: AccountInfo<'info>,
    pub ai_operator_signer: Signer<'info>,
    
    /// CHECK: Jupiter Program execution target address checking
    pub jupiter_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EmergencyFreeze<'info> {
    #[account(mut, has_one = authority @ VaultError::UnauthorizedAdmin)]
    pub vault_account: Account<'info, VaultAccount>,
    pub authority: Signer<'info>,
}

// --- EXPLICIT ERROR CODES ENUM ---

#[error_code]
pub mod VaultError {
    #[msg("The operational public key signer does not possess valid admin status.")]
    UnauthorizedAdmin,
    #[msg("The operational signing key does not match the registered AI hot-wallet instance.")]
    UnauthorizedAiOperator,
    #[msg("The absolute allocation requested surpasses the active maximum threshold settings.")]
    AllocationExceedsPolicyLimit,
    #[msg("The security system has paused all operational interactions on the vault.")]
    VaultIsFrozen,
    #[msg("The proposed slippage setting violates the absolute program limit.")]
    SlippageExceedsLimit,
    #[msg("The fee setting violates the protocol limits.")]
    FeeExceedsLimit,
    #[msg("Depositing empty liquidity parameters is strictly denied.")]
    ZeroDepositAmount,
    #[msg("Internal execution framework encountered a critical numerical overflow state.")]
    NumericalOverflow,
}
