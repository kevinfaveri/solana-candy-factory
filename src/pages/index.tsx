import Head from 'next/head'

import { useState } from "react";
import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";

import {
  shortenAddress,
} from "../utils/candy-machine";
import useCandyMachine from '../hooks/use-candy-machine';
import useWalletBalance from '../hooks/use-wallet-balance';
import Countdown from 'react-countdown';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';


const Home = () => {
  const [balance] = useWalletBalance()
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const wallet = useWallet();

  const { isSoldOut, mintStartDate, isMinting, onMint, onMintMultiple, nftsData } = useCandyMachine()

  return (
    <main className="p-5">
      <Toaster />
      <Head>
        <title>Solana Candy Machine</title>
        <meta name="description" content="Solana Candy Machine is an open-source project using NextJS, 
          Metaplex protocol which serve as an example app for a NFT candy machine app." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {wallet.connected &&
        <p>Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>
      }

      {wallet.connected &&
        <>
          <p>Balance: {(balance || 0).toLocaleString()} SOL</p>
          <p>Available/Minted/Total: {nftsData.itemsRemaining}/{nftsData.itemsRedeemed}/{nftsData.itemsAvailable}</p>
        </>
      }

      <div className="flex flex-col justify-start items-start">
        {wallet.connected &&
          <button type="button"
            disabled={isSoldOut || isMinting || !isActive}
            onClick={onMint}
          >
            {isSoldOut ? (
              "SOLD OUT"
            ) : isActive ?
              <span>MINT {isMinting && 'LOADING...'}</span> :
              <Countdown
                date={mintStartDate}
                onMount={({ completed }) => completed && setIsActive(true)}
                onComplete={() => setIsActive(true)}
                renderer={renderCounter}
              />
            }
          </button>
        }

        {wallet.connected &&
          <button type="button"
            disabled={isSoldOut || isMinting || !isActive}
            onClick={() => onMintMultiple(5)}
          >
            {isSoldOut ? (
              "SOLD OUT"
            ) : isActive ?
              <span>MINT 5 {isMinting && 'LOADING...'}</span> :
              <Countdown
                date={mintStartDate}
                onMount={({ completed }) => completed && setIsActive(true)}
                onComplete={() => setIsActive(true)}
                renderer={renderCounter}
              />
            }
          </button>
        }
      </div>

      <div className="flex float-right space-x-5">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
    </main>
  );
};

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <span>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </span>
  );
};

export default Home;



