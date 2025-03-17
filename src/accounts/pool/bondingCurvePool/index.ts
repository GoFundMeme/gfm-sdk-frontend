import { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Gofundmeme } from "../../../IDL/types/gofundmeme";
import { getPoolPDA } from "../../../utils/pdaUtils";
import { SOL_PUBLIC_KEY } from "../../../constants";
import { BondingCurvePool } from "../../../types";
import { getQuoteForAmount } from "../../../utils/priceUtils";
import Decimal from "decimal.js";
import { buildSwapTransaction } from "../../../instructions/bondingCurve/swap_ix_builder";
import {
  createHolderUtils,
  getDecimals,
  getMintInfo,
} from "../../../utils";
import { getPoolStakerAccountInfo } from "../../poolStakerAccount";
import { buildPoolStakingTransaction } from "../../../instructions/poolStakingNetwork/pool_stake_ix_builder";
import { buildPoolUnstakingTransaction } from "../../../instructions/poolStakingNetwork/pool_unstake_ix_builder";
import { buildPoolClaimStakingRewardsTransaction } from "../../../instructions/poolStakingNetwork/pool_staking_claim_ix_builder";
import { Mint } from "@solana/spl-token";
export const buildBondingCurvePoolUtils = ({
  gfmProgram,
}: {
  gfmProgram: Program<Gofundmeme>;
}) => {
  const fetchBondingCurvePool = async ({
    mintA = SOL_PUBLIC_KEY,
    mintB,
  }: {
    mintA?: PublicKey;
    mintB: PublicKey;
  }) => {
    const poolPDA = getPoolPDA(gfmProgram.programId, mintA, mintB);
    try {
      const pool: BondingCurvePool =
        await gfmProgram.account.bondingCurvePool.fetch(poolPDA);
      return await buildBondingCurvePoolActions({
        gfmProgram,
        pool,
      });
    } catch {
      throw new Error("No bonding curve pool found with this key");
    }
  };
  return { fetchBondingCurvePool };
};

export const buildBondingCurvePoolActions = async ({
  gfmProgram,
  pool,
}: {
  gfmProgram: Program<Gofundmeme>;
  pool: BondingCurvePool;
}) => {
  const poolPDA = getPoolPDA(
    gfmProgram.programId,
    pool.tokenAMint,
    pool.tokenBMint
  );
  const mintA: Mint = await getMintInfo({
    connection: gfmProgram.provider.connection,
    mintAddress: pool.tokenAMint,
  });
  const mintB: Mint = await getMintInfo({
    connection: gfmProgram.provider.connection,
    mintAddress: pool.tokenBMint,
  });

  const refreshPoolData = async () => {
    pool = await gfmProgram.account.bondingCurvePool.fetch(poolPDA);
  };

  const decinalA = await getDecimals({
    connection: gfmProgram.provider.connection,
    mint: pool.tokenAMint,
  });
  const decinalB = await getDecimals({
    connection: gfmProgram.provider.connection,
    mint: pool.tokenBMint,
  });

  const createQuoteForAmountUtil = async (payload: {
    amountInUI: Decimal;
    slippage: number;
    direction: "buy" | "sell";
  }) => {
    await refreshPoolData();
    return await getQuoteForAmount({
      pool,
      ...payload,
      decimals: payload.direction === "buy" ? decinalA : decinalB,
    });
  };
  const createBuyTransaction = async ({
    amountInUI,
    slippage,
    funder,
  }: {
    amountInUI: Decimal;
    slippage: number;
    funder: PublicKey;
  }) => {
    await refreshPoolData();
    const quote = await getQuoteForAmount({
      pool,
      direction: "buy",
      amountInUI,
      slippage,
      decimals: decinalA,
    });
    return {
      quote,
      transaction: await buildSwapTransaction({
        gfmProgram,
        funder,
        pool,
        quote: quote.quote,
      }),
    };
  };
  const createSellTransaction = async ({
    amountInUI,
    slippage,
    funder,
  }: {
    amountInUI: Decimal;
    slippage: number;
    funder: PublicKey;
  }) => {
    await refreshPoolData();
    const quote = await getQuoteForAmount({
      pool,
      direction: "sell",
      amountInUI,
      slippage,
      decimals: decinalB,
    });
    return {
      quote,
      transaction: await buildSwapTransaction({
        gfmProgram,
        funder,
        pool,
        quote: quote.quote,
      }),
    };
  };


  const fetchStakerAccount = function (payload: { staker: PublicKey }) {
    return getPoolStakerAccountInfo({
      gfmProgram,
      pool,
      ...payload,
    });
  };

  const createPoolStakeTransaction = function (payload: {
    staker: PublicKey;
    amountUI: number;
  }) {
    return buildPoolStakingTransaction({
      gfmProgram,
      pool,
      ...payload,
    });
  };
  const createPoolUnstakeTransaction = function (payload: {
    staker: PublicKey;
    amountUI: number;
  }) {
    return buildPoolUnstakingTransaction({
      gfmProgram,
      pool,
      ...payload,
    });
  };
  const createPoolClaimStakingRewardsTransaction = function (payload: {
    staker: PublicKey;
  }) {
    return buildPoolClaimStakingRewardsTransaction({
      gfmProgram,
      pool,
      ...payload,
    });
  };

  const { fetchBalanceA, fetchBalanceB } = await createHolderUtils({
    mintA,
    mintB,
    gfmProgram,
  });

  const getMarketcapInSol = async (refreshPool?: boolean) => {
    if (refreshPool)
      await refreshPoolData()
    return pool.totalRaised.mul(pool.totalSupply).div(pool.tokenBalance).div(new BN(LAMPORTS_PER_SOL)).toNumber()
  }
  const getVitualPricePerToken = async (refreshPool?: boolean) => {
    return (await getMarketcapInSol(refreshPool)) / pool.totalSupply.div(new BN(10 ** mintB.decimals)).toNumber()
  }

  return {
    mintA,
    mintB,
    poolData: pool,
    refreshPoolData,
    utils: {
      balanceUtils: {
        fetchBalanceA,
        fetchBalanceB,
      },
      marketUtils: {
        getVitualPricePerToken: getVitualPricePerToken,
        getMarketCapInSol: getMarketcapInSol
      }
    },
    actions: {
      swap: {
        getQuoteForAmount: createQuoteForAmountUtil,
        buy: createBuyTransaction,
        sell: createSellTransaction,
      },
      staking: {
        fetchStakerAccount,
        stake: createPoolStakeTransaction,
        unstake: createPoolUnstakeTransaction,
        claimRewards: createPoolClaimStakingRewardsTransaction,
      },
    },
  };
};