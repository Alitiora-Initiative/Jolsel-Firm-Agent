//! Jolsel vault.
//!
//! SOL deposits sit in a program-derived account the user owns.
//! Only that user's signature can withdraw. The dev authority can
//! change the open-fee floor. It cannot move deposited SOL.
//!
//! This crate is source. It is not deployed. A program id appears
//! only after `solana program deploy` on mainnet.

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint,
    entrypoint::ProgramResult,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

const CONFIG_SEED: &[u8] = b"config";
const VAULT_SEED: &[u8] = b"vault";
/// 8 disc + 32 authority + 32 treasury + 8 cap + 8 deposited + 8 min_fee + 1 bump
pub const CONFIG_LEN: usize = 97;
/// 8 disc + 32 owner + 8 deposited + 8 opened_unix + 4 trades + 1 bump
pub const VAULT_LEN: usize = 61;
const DISC_CONFIG: u64 = 0x4A4F_4C53_454C_0001;
const DISC_VAULT: u64 = 0x4A4F_4C53_454C_0002;
/// Hard ceiling from the firm rules. Initialize may set a lower cap, never a higher one.
pub const MAX_CAP_LAMPORTS: u64 = 100_000 * 1_000_000_000;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let (tag, rest) = data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;
    match tag {
        0 => initialize(program_id, accounts, rest),
        1 => open_vault(program_id, accounts, rest),
        2 => deposit(program_id, accounts, rest),
        3 => withdraw(program_id, accounts, rest),
        4 => set_min_fee(program_id, accounts, rest),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

fn initialize(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let config = next_account_info(account_info_iter)?;
    let treasury = next_account_info(account_info_iter)?;
    let system = next_account_info(account_info_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let (expected, bump) = Pubkey::find_program_address(&[CONFIG_SEED], program_id);
    if expected != *config.key {
        return Err(ProgramError::InvalidSeeds);
    }
    if config.lamports() > 0 || !config.data_is_empty() {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    let treasury_key = read_pubkey(data, 0)?;
    if treasury_key != *treasury.key {
        return Err(ProgramError::InvalidArgument);
    }
    let min_fee = read_u64(data, 32)?;
    let mut cap = read_u64(data, 40)?;
    if cap == 0 || cap > MAX_CAP_LAMPORTS {
        cap = MAX_CAP_LAMPORTS;
    }

    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(CONFIG_LEN);
    invoke_signed(
        &system_instruction::create_account(
            authority.key,
            config.key,
            lamports,
            CONFIG_LEN as u64,
            program_id,
        ),
        &[authority.clone(), config.clone(), system.clone()],
        &[&[CONFIG_SEED, &[bump]]],
    )?;

    let mut raw = config.try_borrow_mut_data()?;
    write_u64(&mut raw, 0, DISC_CONFIG);
    raw[8..40].copy_from_slice(authority.key.as_ref());
    raw[40..72].copy_from_slice(treasury.key.as_ref());
    write_u64(&mut raw, 72, cap);
    write_u64(&mut raw, 80, 0);
    write_u64(&mut raw, 88, min_fee);
    raw[96] = bump;
    Ok(())
}

fn open_vault(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let config = next_account_info(account_info_iter)?;
    let treasury = next_account_info(account_info_iter)?;
    let system = next_account_info(account_info_iter)?;

    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let cfg = Config::load(config, program_id)?;
    if cfg.treasury != *treasury.key {
        return Err(ProgramError::InvalidArgument);
    }
    let fee = read_u64(data, 0)?;
    if fee < cfg.min_fee {
        return Err(ProgramError::InsufficientFunds);
    }

    let (expected, bump) = Pubkey::find_program_address(&[VAULT_SEED, user.key.as_ref()], program_id);
    if expected != *vault.key {
        return Err(ProgramError::InvalidSeeds);
    }
    if vault.lamports() > 0 || !vault.data_is_empty() {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // Fee goes to the treasury address stored in config. It is not a deposit.
    invoke_signed(
        &system_instruction::transfer(user.key, treasury.key, fee),
        &[user.clone(), treasury.clone(), system.clone()],
        &[],
    )?;

    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(VAULT_LEN);
    invoke_signed(
        &system_instruction::create_account(
            user.key,
            vault.key,
            lamports,
            VAULT_LEN as u64,
            program_id,
        ),
        &[user.clone(), vault.clone(), system.clone()],
        &[&[VAULT_SEED, user.key.as_ref(), &[bump]]],
    )?;

    let opened = Clock::get()?.unix_timestamp;
    let mut raw = vault.try_borrow_mut_data()?;
    write_u64(&mut raw, 0, DISC_VAULT);
    raw[8..40].copy_from_slice(user.key.as_ref());
    write_u64(&mut raw, 40, 0);
    write_i64(&mut raw, 48, opened);
    write_u32(&mut raw, 56, 0);
    raw[60] = bump;
    Ok(())
}

fn deposit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let config = next_account_info(account_info_iter)?;
    let system = next_account_info(account_info_iter)?;

    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let amount = read_u64(data, 0)?;
    if amount == 0 {
        return Err(ProgramError::InvalidArgument);
    }
    let mut cfg = Config::load(config, program_id)?;
    let mut book = Vault::load(vault, program_id)?;
    if book.owner != *user.key {
        return Err(ProgramError::IllegalOwner);
    }
    let (expected, _) = Pubkey::find_program_address(&[VAULT_SEED, user.key.as_ref()], program_id);
    if expected != *vault.key {
        return Err(ProgramError::InvalidSeeds);
    }
    let next_total = cfg
        .deposited
        .checked_add(amount)
        .ok_or(ProgramError::InvalidArgument)?;
    if next_total > cfg.cap {
        return Err(ProgramError::InvalidArgument);
    }

    invoke_signed(
        &system_instruction::transfer(user.key, vault.key, amount),
        &[user.clone(), vault.clone(), system.clone()],
        &[],
    )?;

    book.deposited = book
        .deposited
        .checked_add(amount)
        .ok_or(ProgramError::InvalidArgument)?;
    cfg.deposited = next_total;
    book.write(vault)?;
    cfg.write(config)?;
    Ok(())
}

fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let config = next_account_info(account_info_iter)?;

    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let amount = read_u64(data, 0)?;
    if amount == 0 {
        return Err(ProgramError::InvalidArgument);
    }
    let mut cfg = Config::load(config, program_id)?;
    let mut book = Vault::load(vault, program_id)?;
    if book.owner != *user.key {
        return Err(ProgramError::IllegalOwner);
    }
    if book.deposited < amount || cfg.deposited < amount {
        return Err(ProgramError::InsufficientFunds);
    }
    let rent = Rent::get()?;
    let keep = rent.minimum_balance(VAULT_LEN);
    let liquid = vault
        .lamports()
        .checked_sub(keep)
        .ok_or(ProgramError::InsufficientFunds)?;
    if liquid < amount {
        return Err(ProgramError::InsufficientFunds);
    }

    **vault.try_borrow_mut_lamports()? -= amount;
    **user.try_borrow_mut_lamports()? += amount;

    book.deposited -= amount;
    cfg.deposited -= amount;
    book.write(vault)?;
    cfg.write(config)?;
    Ok(())
}

fn set_min_fee(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let config = next_account_info(account_info_iter)?;
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let mut cfg = Config::load(config, program_id)?;
    if cfg.authority != *authority.key {
        return Err(ProgramError::IllegalOwner);
    }
    cfg.min_fee = read_u64(data, 0)?;
    cfg.write(config)?;
    Ok(())
}

struct Config {
    authority: Pubkey,
    treasury: Pubkey,
    cap: u64,
    deposited: u64,
    min_fee: u64,
    bump: u8,
}

impl Config {
    fn load(account: &AccountInfo, program_id: &Pubkey) -> Result<Self, ProgramError> {
        if account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        let raw = account.try_borrow_data()?;
        if raw.len() < CONFIG_LEN || read_u64(&raw, 0)? != DISC_CONFIG {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Self {
            authority: Pubkey::new_from_array(read_array(&raw, 8)?),
            treasury: Pubkey::new_from_array(read_array(&raw, 40)?),
            cap: read_u64(&raw, 72)?,
            deposited: read_u64(&raw, 80)?,
            min_fee: read_u64(&raw, 88)?,
            bump: raw[96],
        })
    }

    fn write(&self, account: &AccountInfo) -> ProgramResult {
        let mut raw = account.try_borrow_mut_data()?;
        write_u64(&mut raw, 0, DISC_CONFIG);
        raw[8..40].copy_from_slice(self.authority.as_ref());
        raw[40..72].copy_from_slice(self.treasury.as_ref());
        write_u64(&mut raw, 72, self.cap);
        write_u64(&mut raw, 80, self.deposited);
        write_u64(&mut raw, 88, self.min_fee);
        raw[96] = self.bump;
        Ok(())
    }
}

struct Vault {
    owner: Pubkey,
    deposited: u64,
    opened_unix: i64,
    trades: u32,
    bump: u8,
}

impl Vault {
    fn load(account: &AccountInfo, program_id: &Pubkey) -> Result<Self, ProgramError> {
        if account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        let raw = account.try_borrow_data()?;
        if raw.len() < VAULT_LEN || read_u64(&raw, 0)? != DISC_VAULT {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Self {
            owner: Pubkey::new_from_array(read_array(&raw, 8)?),
            deposited: read_u64(&raw, 40)?,
            opened_unix: read_i64(&raw, 48)?,
            trades: read_u32(&raw, 56)?,
            bump: raw[60],
        })
    }

    fn write(&self, account: &AccountInfo) -> ProgramResult {
        let mut raw = account.try_borrow_mut_data()?;
        write_u64(&mut raw, 0, DISC_VAULT);
        raw[8..40].copy_from_slice(self.owner.as_ref());
        write_u64(&mut raw, 40, self.deposited);
        write_i64(&mut raw, 48, self.opened_unix);
        write_u32(&mut raw, 56, self.trades);
        raw[60] = self.bump;
        Ok(())
    }
}

fn read_array(data: &[u8], at: usize) -> Result<[u8; 32], ProgramError> {
    let slice = data
        .get(at..at + 32)
        .ok_or(ProgramError::InvalidInstructionData)?;
    let mut out = [0u8; 32];
    out.copy_from_slice(slice);
    Ok(out)
}

fn read_pubkey(data: &[u8], at: usize) -> Result<Pubkey, ProgramError> {
    Ok(Pubkey::new_from_array(read_array(data, at)?))
}

fn read_u64(data: &[u8], at: usize) -> Result<u64, ProgramError> {
    let slice = data
        .get(at..at + 8)
        .ok_or(ProgramError::InvalidInstructionData)?;
    let mut buf = [0u8; 8];
    buf.copy_from_slice(slice);
    Ok(u64::from_le_bytes(buf))
}

fn read_i64(data: &[u8], at: usize) -> Result<i64, ProgramError> {
    Ok(read_u64(data, at)? as i64)
}

fn read_u32(data: &[u8], at: usize) -> Result<u32, ProgramError> {
    let slice = data
        .get(at..at + 4)
        .ok_or(ProgramError::InvalidInstructionData)?;
    let mut buf = [0u8; 4];
    buf.copy_from_slice(slice);
    Ok(u32::from_le_bytes(buf))
}

fn write_u64(data: &mut [u8], at: usize, value: u64) {
    data[at..at + 8].copy_from_slice(&value.to_le_bytes());
}

fn write_i64(data: &mut [u8], at: usize, value: i64) {
    write_u64(data, at, value as u64);
}

fn write_u32(data: &mut [u8], at: usize, value: u32) {
    data[at..at + 4].copy_from_slice(&value.to_le_bytes());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cap_is_one_hundred_thousand_sol() {
        assert_eq!(MAX_CAP_LAMPORTS, 100_000_000_000_000);
    }

    #[test]
    fn instruction_bytes_round_trip() {
        let mut data = [0u8; 48];
        let key = Pubkey::new_from_array([7u8; 32]);
        data[0..32].copy_from_slice(key.as_ref());
        write_u64(&mut data, 32, 1_000);
        write_u64(&mut data, 40, MAX_CAP_LAMPORTS);
        assert_eq!(read_pubkey(&data, 0).unwrap(), key);
        assert_eq!(read_u64(&data, 32).unwrap(), 1_000);
        assert_eq!(read_u64(&data, 40).unwrap(), MAX_CAP_LAMPORTS);
    }
}
