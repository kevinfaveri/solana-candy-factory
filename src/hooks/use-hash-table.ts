import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import toast from "react-hot-toast";

import { programs } from '@metaplex/js';
const { metadata: { Metadata, MetadataProgram } } = programs

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);
export const MAX_NAME_LENGTH = 32;
export const MAX_URI_LENGTH = 200;
export const MAX_SYMBOL_LENGTH = 10;
export const MAX_CREATOR_LEN = 32 + 1 + 1;

export async function fetchHashTable(hash: string, metadataEnabled?: boolean): Promise<any[]> {
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


  const mintHashes: any = []

  for (let index = 0; index < metadataAccounts.length; index++) {
    const account = metadataAccounts[index];
    const accountInfo: any = await connection.getParsedAccountInfo(account.pubkey);
    const metadata = new Metadata(hash.toString(), accountInfo.value);
    if (metadataEnabled) mintHashes.push(metadata.data)
    else mintHashes.push(metadata.data.mint)
  }


  return mintHashes
}

export function useHashTable(candyMachineId: string, metadataEnabled: boolean) {
  const [hashTable, setHashTable] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getHashTable = async () => {
    if (!candyMachineId || !candyMachineId.length) {
      toast.error("Please type the Candy Machine ID in the input box.")

      return
    }
    try {
      setIsLoading(true)
      const data = await fetchHashTable(candyMachineId, metadataEnabled)
      setHashTable(data)
      if (data.length === 0)
        toast.success("Zero mint hashes have been found so far for this candy machine.")
    } catch (error) {
      console.error(error)
      toast.error("An error happened! Please try again later!")
    }
    setIsLoading(false)
  }

  return { hashTable, isLoading, getHashTable }
}