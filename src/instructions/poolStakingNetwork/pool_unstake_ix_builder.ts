import type { Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  getMint,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SYSVAR_CLOCK_PUBKEY, SystemProgram } from "@solana/web3.js";
import { BondingCurvePool, FairLaunchPool } from "../../types";
import { Gofundmeme } from "../../IDL/types/gofundmeme";
import {
  getPoolPDA,
  getPoolStakingNetwork,
  getPoolStakerAccount,
} from "../../utils";
import BN from "bn.js";

export const buildPoolUnstakingTransaction = async ({
  gfmProgram,
  pool,
  staker,
  amountUI,
}: {
  staker: PublicKey;
  amountUI: number;
  gfmProgram: Program<Gofundmeme>;
  pool: BondingCurvePool | FairLaunchPool;
}) => {
  const { tokenAMint, tokenBMint } = pool;

  const poolPDA = getPoolPDA(gfmProgram.programId, tokenAMint, tokenBMint);
  const poolStakingNetwork = getPoolStakingNetwork(
    gfmProgram.programId,
    poolPDA
  );

  const stakerAccount = getPoolStakerAccount(
    gfmProgram.programId,
    tokenBMint,
    staker
  );

  const stakerTokenAccountB = getAssociatedTokenAddressSync(
    tokenBMint,
    staker,
    true
  );
  const stakerAccountEscrowB = getAssociatedTokenAddressSync(
    tokenBMint,
    stakerAccount,
    true
  );

  const mint = await getMint(gfmProgram.provider.connection, tokenBMint);
  const scaledAmount = new BN(amountUI).mul(
    new BN(Math.pow(10, mint.decimals))
  );

  const transaction = await gfmProgram.methods
    .poolUnstake(scaledAmount)
    .accounts({
      staker,
      pool: poolPDA,
      poolStakingNetwork,
      stakerAccount,
      stakerAccountEscrowB,
      stakerTokenAccountB,
      mintA: tokenAMint,
      mintB: tokenBMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .transaction();
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_000_000,
    })
  );
  return transaction;
};
