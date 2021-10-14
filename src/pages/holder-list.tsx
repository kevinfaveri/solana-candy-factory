import React, { useState } from 'react';
import Head from 'next/head'
import Header from '../components/header';
import { Toaster } from 'react-hot-toast';
import { CopyBlock, dracula } from 'react-code-blocks';
import Footer from '../components/footer';
import { useHolderList } from '../hooks/use-holder-list';

const HolderList: React.FC = () => {
  const [candyMachineId, setCandyMachineId] = useState('')

  const { holderList, isLoading, getHolderList } = useHolderList(candyMachineId)

  return <div className="flex flex-col justify-between h-full">
    <Toaster />

    <main className="p-5">
      <Head>
        <title>Solana Candy Factory: Holder List</title>
        <meta name="description" content="Get the Holder List Addresses for a specific Candy Machine NFT Collection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex flex-col items-center space-y-10">
        <div className="flex flex-col justify-center items-center flex-1 space-y-10 mt-20">
          <input
            className="text-lg text-black font-bold uppercase 
          w-96 text-center rounded-md shadow-md"
            onChange={(e) => setCandyMachineId(e.target.value as any)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isLoading ? null : getHolderList()
              }
            }}
            placeholder="TYPE YOUR CANDY MACHINE ID" />
          <button
            type="button"
            onClick={isLoading ? () => null : getHolderList}
            className="bg-purple-400 hover:bg-purple-500 
          transition p-1 text-gray-800 font-bold">
            {isLoading ? 'Loading...' : 'Get Holder List'}
          </button>
        </div>

        {holderList.size > 0 && !isLoading && <div className="w-full lg:w-1/2">
          <CopyBlock
            text={JSON.stringify(Array.from(holderList), null, 4)}
            language="javascript"
            theme={dracula}
            wrapLines
          />
        </div>}
      </div>
    </main>
    <Footer />

  </div>;
}

export default HolderList;