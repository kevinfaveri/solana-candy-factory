import React, { useState } from 'react';
import Head from 'next/head'
import Header from '../components/header';
import { Toaster } from 'react-hot-toast';
import { CopyBlock, dracula } from 'react-code-blocks';
import Footer from '../components/footer';
import { useForgottenAllocated } from '../hooks/use-forgotten-allocated';

const FindCandyMachineConfigs: React.FC = () => {
  const [authorityAddress, setAuthorityAddress] = useState('')

  const { candyMachineList, isLoading, getForgottenCandyMachines } = useForgottenAllocated(authorityAddress)

  return <div className="flex flex-col justify-between h-full">
    <Toaster />

    <main className="p-5">
      <Head>
        <title>Solana Candy Factory: Find Candy Machine Configs</title>
        <meta name="description" content="Find Candy Machine Configs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex flex-col items-center space-y-10">
        <div className="flex flex-col justify-center items-center flex-1 space-y-10 mt-20">
          <input
            className="text-lg text-black font-bold uppercase 
          w-96 text-center rounded-md shadow-md"
            onChange={(e) => setAuthorityAddress(e.target.value as any)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isLoading ? null : getForgottenCandyMachines()
              }
            }}
            placeholder="TYPE YOUR WALLET PUBLIC KEY" />
          <button
            type="button"
            onClick={isLoading ? () => null : getForgottenCandyMachines}
            className="bg-purple-400 hover:bg-purple-500 
          transition p-1 text-gray-800 font-bold">
            {isLoading ? 'Loading...' : 'Get Candy Machine Configs'}
          </button>
        </div>

        {candyMachineList.length > 0 && !isLoading && <div className="w-full lg:w-1/2">
          <CopyBlock
            text={JSON.stringify(Array.from(candyMachineList), null, 4)}
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

export default FindCandyMachineConfigs;