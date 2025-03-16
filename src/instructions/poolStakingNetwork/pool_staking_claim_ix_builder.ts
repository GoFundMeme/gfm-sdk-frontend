import { BN, Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  getMint,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram
} from "@solana/web3.js";
import { BondingCurvePool, FairLaunchPool } from "../../types";
import { Gofundmeme } from "../../IDL/types/gofundmeme";
import {
  getPoolPDA,
  getPoolStakingNetwork,
  getPoolStakerAccount,
} from "../../utils";

export const buildPoolClaimStakingRewardsTransaction = async ({
  gfmProgram,
  pool,
  staker,
}: {
  staker: PublicKey;
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

  const stakingNetworkTokenAccountA = getAssociatedTokenAddressSync(
    tokenAMint,
    poolPDA,
    true
  );
  const stakingNetworkTokenAccountB = getAssociatedTokenAddressSync(
    tokenBMint,
    poolPDA,
    true
  );
  const stakerTokenAccountA = getAssociatedTokenAddressSync(
    tokenAMint,
    staker,
    true
  );
  const stakerTokenAccountB = getAssociatedTokenAddressSync(
    tokenBMint,
    staker,
    true
  );

  const transaction = await gfmProgram.methods
    .poolStakerClaim()
    .accounts({
      staker,
      pool: poolPDA,
      poolStakingNetwork,
      stakingNetworkTokenAccountA,
      stakingNetworkTokenAccountB,
      stakerAccount,
      mintA: tokenAMint,
      mintB: tokenBMint,
      stakerTokenAccountA,
      stakerTokenAccountB,
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
