import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import toast from "react-hot-toast";

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);
export const MAX_NAME_LENGTH = 32;
export const MAX_SYMBOL_LENGTH = 10;
export const MAX_URI_LENGTH = 200;
export const MAX_CREATOR_LEN = 32 + 1 + 1;

export async function fetchForgottenAllocatedCandyMachine(hash: string): Promise<Array<any>> {
  const forgottenCandyMachines = await connection.getProgramAccounts(
    new anchor.web3.PublicKey('cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ'),
    {
      filters: [
        {
          memcmp: {
            offset: 8,
            bytes: new anchor.web3.PublicKey(hash).toBase58(),
          },
        },
      ],
    },
  )

  const candyMachineConfigs = []

  for (let index = 0; index < forgottenCandyMachines.length; index++) {
    const cm = forgottenCandyMachines[index];
    // If more than 529 it is a config account and not a candy machine
    if (cm.account.data.byteLength > 529)
      candyMachineConfigs.push({
        "program": {
          "uuid": cm.pubkey.toString().substring(0, 6),
          "config": cm.pubkey.toString()
        },
      })
  }

  return candyMachineConfigs
}

export function useForgottenAllocated(candyMachineId: string) {
  const [candyMachineList, setCandyMachineList] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState(false)

  const getForgottenCandyMachines = async () => {
    if (!candyMachineId || !candyMachineId.length) {
      toast.error("Please type the Authority ID in the input box.")

      return
    }
    try {
      setIsLoading(true)
      const data = await fetchForgottenAllocatedCandyMachine(candyMachineId)
      setCandyMachineList(data)
      if (data.length === 0)
        toast.success("Zero Candy Machine Configs have been found so far for this candy machine.")
    } catch (error) {
      console.error(error)
      toast.error("An error happened! Please try again later!")
    }
    setIsLoading(false)
  }

  return { candyMachineList, isLoading, getForgottenCandyMachines }
}