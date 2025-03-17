import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet as AnchorWallet } from "@coral-xyz/anchor";
import { getGFMProgram } from "../IDL/getGFMProgram";
import { builtPoolUtils } from "../accounts/pool";
import { buildStakingNetworkActions } from "../accounts";
import { buildApiUtils } from "../apis";

export const initGoFundMemeSDK = async ({
  connection,
}: {
  connection: Connection;
}) => {
  const keypair = Keypair.generate();
  const provider = new AnchorProvider(connection, new AnchorWallet(keypair), {
    commitment: "confirmed",
  });
  const gfmProgram = getGFMProgram(provider);

  const getStakingNetwork = async () => {
    return await buildStakingNetworkActions({
      gfmProgram,
    });
  };

  const pools = await builtPoolUtils({ gfmProgram });
  const api = await buildApiUtils(pools, gfmProgram)
  return {
    gfmProgram,
    pools,
    getStakingNetwork: getStakingNetwork,
    api
  };
};
