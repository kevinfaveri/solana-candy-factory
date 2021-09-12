echo "[INFO] Setting Solana to use mainnet network"
solana config set --url https://api.mainnet-beta.solana.com
echo "[INFO] Importing wallet"
echo "Type your wallet PK so the Solana CLI can connect to it"
read answer
echo $answer > ~/.config/solana/candyfactory-mainnet.json
echo "[INFO] Setting config to be the new wallet"
solana config set -k ~/.config/solana/candyfactory-mainnet.json
solana address > ./logs/main/wallet-log.txt
echo "[INFO] Getting Wallet Balance"
solana balance
echo "[INFO] Please check that you have enough SOLs on this wallet to continue"
read -p "Press enter to continue"