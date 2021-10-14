import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import Link from 'next/link'

const Header: React.FC = () => {
  return <div className="flex flex-col md:flex-row justify-between space-x-0 md:space-x-5 space-y-5 md:space-x-0">
    <div className="text-black space-x-5 text-lg font-bold flex items-center">
      <Link href="/">
        <a>Home</a>
      </Link>
      <Link href="/my-nfts">
        <a>My NFTs</a>
      </Link>
    </div>
    <div className="flex space-x-5 items-center">
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  </div>;
}

export default Header;