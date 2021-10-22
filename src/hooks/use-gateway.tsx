import { web3 } from "@project-serum/anchor";
import React, {useContext, useState} from "react";
import { GatewayProvider as SolanaGatewayProvider } from "@civic/solana-gateway-react";
import {useWallet} from "@solana/wallet-adapter-react";

type PublicKey = web3.PublicKey;
type Transaction = web3.Transaction;

export type GatekeeperNetworkProps = { gatekeeperNetwork?: PublicKey, setGatekeeperNetwork: (key?: PublicKey) => void }
const GatekeeperNetworkContext = React.createContext<GatekeeperNetworkProps>({
  gatekeeperNetwork: undefined,
  setGatekeeperNetwork: () => {},
});
export const GatekeeperNetworkProvider:React.FC = ({ children }) => {
  const [gatekeeperNetwork, setGatekeeperNetwork] = useState<PublicKey|undefined>();

  return <GatekeeperNetworkContext.Provider value={{
    gatekeeperNetwork,
    setGatekeeperNetwork
  }}>{children}</GatekeeperNetworkContext.Provider>
}
export const useGatekeeperNetwork = (): GatekeeperNetworkProps => useContext(GatekeeperNetworkContext)


type GatewayWallet = {
  publicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}
export const GatewayProvider:React.FC = ({ children}) => {
  const wallet = useWallet();
  const {gatekeeperNetwork} = useGatekeeperNetwork();

  return (
    (wallet && wallet.connected && wallet.publicKey && gatekeeperNetwork) ?
      <SolanaGatewayProvider
        wallet={wallet as GatewayWallet}
        gatekeeperNetwork={gatekeeperNetwork}
        stage='preprod'
        clusterUrl={process.env.NEXT_PUBLIC_SOLANA_RPC_HOST}
      >
        {children}
      </SolanaGatewayProvider>
      : <>
        {children}
      </>
  );
};
