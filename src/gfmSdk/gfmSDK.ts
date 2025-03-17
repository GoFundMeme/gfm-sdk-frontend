import type { AnchorProvider, Program } from "@coral-xyz/anchor";
import { builtPoolUtils } from "../accounts/pool";
import { buildStakingNetworkActions } from "../accounts";
import { buildApiUtils } from "../apis";
import { Gofundmeme } from "../IDL";
import { GFM_PROGRAM } from "../constants";
import idl from "../IDL/idl/gofundmeme.json";

type InitSDKOptions = (
  idl: Gofundmeme,
  programId: string
) => Program<Gofundmeme>;

export const initGoFundMemeSDK = async (createProgram: InitSDKOptions) => {
  const gfmProgram = createProgram(idl as Gofundmeme, GFM_PROGRAM.toString());

  const getStakingNetwork = async () => {
    return await buildStakingNetworkActions({
      gfmProgram,
    });
  };

  const pools = builtPoolUtils({ gfmProgram });
  const api = await buildApiUtils(pools, gfmProgram);
  return {
    gfmProgram,
    pools,
    getStakingNetwork: getStakingNetwork,
    api,
  };
};
