import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CreateBondingCurvePayload,
  CreateBondingCurveProcessPayload,
  PoolsUtils,
} from "../types";
import { buildBondingCurveApiUtils } from "./pools/bondingCurve";
import { buildFailLaunchApiUtils } from "./pools/fairLaunch";
import { createSubscriptionUtils } from "./websockets/subscriptions/createSubsciptionUtils";
import type { Program } from "@coral-xyz/anchor";
import { Gofundmeme } from "../IDL";

export const BASE_API_URL = "http://build.gofundmeme.io/api/v1";
export const BASE_WS_URL = "build.gofundmeme.io/api/v1";

export const buildApiUtils = async (
  poolUtils: PoolsUtils,
  gfmProgram: Program<Gofundmeme>
) => {
  const bondingCurveApiUtils = await buildBondingCurveApiUtils(
    poolUtils,
    gfmProgram
  );
  const fairLaunchApiUtilse = await buildFailLaunchApiUtils(
    poolUtils,
    gfmProgram
  );
  const subscription = createSubscriptionUtils();
  return {
    bondingCurve: bondingCurveApiUtils,
    fairLaunch: fairLaunchApiUtilse,
    subscription,
  };
};
