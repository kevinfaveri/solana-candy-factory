import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import toast from "react-hot-toast";

import { programs } from '@metaplex/js';
import allMarkets from "../utils/ marketplaces";
const { metadata: { Metadata, MetadataProgram } } = programs

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);
export const MAX_NAME_LENGTH = 32;
export const MAX_URI_LENGTH = 200;
export const MAX_SYMBOL_LENGTH = 10;
export const MAX_CREATOR_LEN = 32 + 1 + 1;

export async function fetchHolderList(hash: string): Promise<Set<String>> {
  const metadataAccounts = await MetadataProgram.getProgramAccounts(
    connection,
    {
      filters: [
        {
          memcmp: {
            offset:
              1 +
              32 +
              32 +
              4 +
              MAX_NAME_LENGTH +
              4 +
              MAX_URI_LENGTH +
              4 +
              MAX_SYMBOL_LENGTH +
              2 +
              1 +
              4 +
              0 * MAX_CREATOR_LEN,
            bytes: hash,
          },
        },
      ],
    },
  )


  const allHolders = new Set<string>([])

  for (let index = 0; index < metadataAccounts.length; index++) {
    const account = metadataAccounts[index];
    const accountInfo: any = await connection.getParsedAccountInfo(account.pubkey);
    const metadata = new Metadata(hash.toString(), accountInfo.value);
    const allTokenHolders: any = await connection.getTokenLargestAccounts(new anchor.web3.PublicKey(metadata.data.mint));
    const onlyHolders = allTokenHolders.value.filter((tokenHolder: any) => tokenHolder.uiAmount)
    const largestTokenHolder = onlyHolders[0]
    const tokenHolderAddress = largestTokenHolder.address
    const tokenHolderOwner: any = await connection.getParsedAccountInfo(tokenHolderAddress);
    if(!allMarkets.includes(tokenHolderOwner.value.data.parsed.info.owner))
      allHolders.add(tokenHolderOwner.value.data.parsed.info.owner)
  }

  return allHolders
}

export function useHolderList(candyMachineId: string) {
  const [holderList, setHolderList] = useState<Set<String>>(new Set([]))
  const [isLoading, setIsLoading] = useState(false)

  const getHolderList = async () => {
    if (!candyMachineId || !candyMachineId.length) {
      toast.error("Please type the Candy Machine ID in the input box.")

      return
    }
    try {
      setIsLoading(true)
      const data = await fetchHolderList(candyMachineId)
      setHolderList(data)
      if (data.size === 0)
        toast.success("Zero mint hashes have been found so far for this candy machine.")
    } catch (error) {
      console.error(error)
      toast.error("An error happened! Please try again later!")
    }
    setIsLoading(false)
  }

  return { holderList, isLoading, getHolderList }
}