import type { Program } from "@coral-xyz/anchor";
import { Gofundmeme } from "../../IDL/types/gofundmeme";
import { PublicKey } from "@solana/web3.js";
import { getPoolPDA } from "../../utils/pdaUtils";
import { SOL_PUBLIC_KEY } from "../../constants";
import {
  buildBondingCurvePoolActions,
  buildBondingCurvePoolUtils,
} from "./bondingCurvePool";
import {
  buildFairLaunchPoolActions,
  buildFairLaunchPoolUtils,
} from "./fairLaunchPool";

export enum PoolLaunchType {
  FAIR_LAUNCH = "fairLaunch",
  BONDING_CURVE = "bondingCurve",
}

export const buildGenericPoolUtils = ({
  gfmProgram,
}: {
  gfmProgram: Program<Gofundmeme>;
}) => {
  return async ({
    mintA = SOL_PUBLIC_KEY,
    mintB,
  }: {
    mintA?: PublicKey;
    mintB: PublicKey;
  }) => {
    const poolPDA = getPoolPDA(gfmProgram.programId, mintA, mintB);
    try {
      const pool = await gfmProgram.account.pool.fetch(poolPDA);
      return {
        poolType: PoolLaunchType.FAIR_LAUNCH,
        response: await buildFairLaunchPoolActions({
          gfmProgram,
          pool,
        }),
      };
    } catch {}
    try {
      const pool = await gfmProgram.account.bondingCurvePool.fetch(poolPDA);
      return {
        poolType: PoolLaunchType.BONDING_CURVE,
        response: await buildBondingCurvePoolActions({
          gfmProgram,
          pool,
        }),
      };
    } catch {}
    throw new Error("No pool found");
  };
};

export const builtPoolUtils = ({
  gfmProgram,
}: {
  gfmProgram: Program<Gofundmeme>;
}) => {
  return {
    fetchGenericPool: buildGenericPoolUtils({
      gfmProgram,
    }),
    fairLaunch: buildFairLaunchPoolUtils({ gfmProgram }),
    bondingCurve: buildBondingCurvePoolUtils({
      gfmProgram,
    }),
  };
};
