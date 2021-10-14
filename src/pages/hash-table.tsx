import React, { useState } from 'react';
import Head from 'next/head'
import Header from '../components/header';
import { Toaster } from 'react-hot-toast';
import { CopyBlock, dracula } from 'react-code-blocks';
import Footer from '../components/footer';
import { useHashTable } from '../hooks/use-hash-table';

const HashTable: React.FC = () => {
  const [candyMachineId, setCandyMachineId] = useState('')
  const [metadataEnabled, setMetadataEnabled] = useState(false)

  const { hashTable, isLoading, getHashTable } = useHashTable(candyMachineId, metadataEnabled)

  return <div className="flex flex-col justify-between h-full">
    <Toaster />

    <main className="p-5">
      <Head>
        <title>Solana Candy Factory: Hash Table</title>
        <meta name="description" content="Get the Hash Table for listing your Candy Machine NFT Collection on major marketplaces" />
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
                isLoading ? null : getHashTable()
              }
            }}
            placeholder="TYPE YOUR CANDY MACHINE ID" />
          <div className="text-lg text-black font-bold space-x-3">
            <span>GET METADATA</span>
            <input type="checkbox" onChange={(e) => setMetadataEnabled(e.target.checked)} />
          </div>
          <button
            type="button"
            onClick={isLoading ? () => null : getHashTable}
            className="bg-purple-400 hover:bg-purple-500 
          transition p-1 text-gray-800 font-bold">
            {isLoading ? 'Loading...' : 'Get Hash Table'}
          </button>
        </div>

        {hashTable.length > 0 && !isLoading && <div className="w-full lg:w-1/2">
          <CopyBlock
            text={JSON.stringify(hashTable, null, 4)}
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

export default HashTable;