import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import * as anchor from "@project-serum/anchor";
import { getNftsForOwner } from '../utils/candy-machine';

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const useWalletNfts = () => {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false)

  const [nfts, setNfts] = useState<Array<any>>([])

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      setIsLoading(true)

      const nftsForOwner = await getNftsForOwner(connection, wallet.publicKey);

     setNfts(nftsForOwner as any)
     setIsLoading(false)
    })();
  }, [wallet])

  return [isLoading, nfts];
}

export default useWalletNfts;