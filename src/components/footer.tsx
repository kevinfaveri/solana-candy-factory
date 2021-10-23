import React from 'react';
import Link from 'next/link'

const Footer: React.FC = () => {
  return <div className="text-gray-800 font-bold space-x-2 flex justify-end items-end mt-10">
    <span>TOOLS:</span>
    <div className="text-blue-400 hover:text-blue-500 uppercase transition space-x-2 font-bold flex items-center">
      <Link href="/hash-table">
        <a>Hash Table</a>
      </Link>
    </div>
    <span>|</span>
    <div className="text-blue-400 hover:text-blue-500 uppercase transition space-x-2 font-bold flex items-center">
      <Link href="/holder-list">
        <a>Holder List</a>
      </Link>
    </div>
    <span>|</span>
    <div className="text-blue-400 hover:text-blue-500 uppercase transition space-x-2 font-bold flex items-center">
      <Link href="/find-candy-machine-configs">
        <a>Get Candy Machine Configs</a>
      </Link>
    </div>
  </div>;
}

export default Footer;