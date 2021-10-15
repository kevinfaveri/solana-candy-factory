import Head from 'next/head'

import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";
import Header from '../components/header';
import Footer from '../components/footer';
import useWalletNfts from '../hooks/use-wallet-nfts';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MyNfts = () => {
  const wallet = useWallet();

  const [isLoading, nfts]: any = useWalletNfts()
  return (
    <div className="flex flex-col justify-between h-full">
      <main className="p-5">
        <Toaster />
        <Head>
          <title>Solana Candy Factory - My NFTs</title>
          <meta name="description" content="Solana blockchain candy machine app boilerplate on top of Metaplex Candy Machine. NextJS, Tailwind, Anchor, SolanaLabs.React, dev/mainnet automation scripts." />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header />

        <div className="flex flex-col justify-center items-center flex-1 space-y-10 mt-20 divide-y-4 divide-purple-400">
          {isLoading && <h1 className="text-lg text-black font-bold animate-pulse">Loading your NFT&apos;s, please wait...</h1>}
          {!isLoading && !wallet.connected && <h1 className="text-lg text-black font-bold">Please connect your wallet.</h1>}
          {!isLoading && wallet.connected && nfts.length === 0 && <h1 className="text-lg text-black font-bold">
            You do not have &quot;NFTs&quot;
          </h1>}

          {nfts.map((nft: any) => <div key={nft.name} className="flex pt-10 flex-col items-center 
            justify-center text-gray-800 font-bold uppercase space-y-5">
            <div className="frame flex-grow-0" style={{ padding: 5 }}>
              <img src={nft.image} alt="NFT" />
            </div>
            <div className="flex flex-col text-xl space-x-3 items-center">

              <a target="_blank" href={`${nft.external_url}/${nft.id}`}
                className="flex space-x-3 text-black hover:text-purple-500" rel="noreferrer">
                <span>{nft.name}</span>
                <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4" />
              </a>
            </div>
          </div>)}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default MyNfts;



