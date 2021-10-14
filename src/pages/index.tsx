import Head from 'next/head'

import { useState } from "react";
import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";
import useCandyMachine from '../hooks/use-candy-machine';
import Header from '../components/header';
import Footer from '../components/footer';
import useWalletBalance from '../hooks/use-wallet-balance';
import { shortenAddress } from '../utils/candy-machine';
import Countdown from 'react-countdown';

const Home = () => {
  const [balance] = useWalletBalance()
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const wallet = useWallet();

  const { isSoldOut, mintStartDate, isMinting, onMint, onMintMultiple, nftsData } = useCandyMachine()

  return (
    <main className="p-5">
      <Toaster />
      <Head>
        <title>Solana Candy Factory</title>
        <meta name="description" content="Solana blockchain candy machine app boilerplate on top of Metaplex Candy Machine. NextJS, Tailwind, Anchor, SolanaLabs.React, dev/mainnet automation scripts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex flex-col justify-center items-center flex-1 space-y-3 mt-20">
        <img
          className="rounded-md shadow-lg"
          src={`/candy.jpeg`}
          height={200}
          width={200}
          alt="Candy Image" />

        <span className="text-gray-800 font-bold text-2xl cursor-default">
          THIS IS THE BEST CANDY MACHINE EVER
        </span>

        {!wallet.connected && <span
          className="text-gray-800 font-bold text-2xl cursor-default">
          NOT CONNECTED...
        </span>}

        {wallet.connected &&
          <p className="text-gray-800 font-bold text-lg cursor-default">Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>
        }

        {wallet.connected &&
          <>
            <p className="text-gray-800 font-bold text-lg cursor-default">Balance: {(balance || 0).toLocaleString()} SOL</p>
            <p className="text-gray-800 font-bold text-lg cursor-default">Available/Minted/Total: {nftsData.itemsRemaining}/{nftsData.itemsRedeemed}/{nftsData.itemsAvailable}</p>
          </>
        }

        <div className="flex flex-col justify-start items-start">
          {wallet.connected &&
            <button type="button"
              className="text-black font-bold text-lg cursor-pointer"
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
              className="text-black font-bold text-lg cursor-pointer"
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
        <Footer />
      </div>
    </main>
  );
};

const renderCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <span className="text-gray-800 font-bold text-2xl cursor-default">
      Live in {days} days, {hours} hours, {minutes} minutes, {seconds} seconds
    </span>
  );
};

export default Home;



