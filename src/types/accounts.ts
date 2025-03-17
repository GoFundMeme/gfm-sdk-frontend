import { Program } from "@coral-xyz/anchor";
import { Gofundmeme } from "../IDL/types/gofundmeme";
import { getStakingNetworkState } from "../accounts/stakingNetwork/utils";
import { builtPoolUtils } from "../accounts";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

let program: Program<Gofundmeme>;

export type PoolsUtils = UnwrapPromise<ReturnType<typeof builtPoolUtils>>;
export type FairLaunchPool = UnwrapPromise<ReturnType<typeof program.account.pool.fetch>>;
export type BondingCurvePool = UnwrapPromise<ReturnType<typeof program.account.bondingCurvePool.fetch>>;
export type StakingNetworkState = UnwrapPromise<ReturnType<typeof getStakingNetworkState>>;
export type PoolStakingNetworkNetwork = UnwrapPromise<ReturnType<typeof program.account.gfmPoolStakingNetwork.fetch>>;
