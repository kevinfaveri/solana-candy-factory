echo "[INFO] Cleaning older cache folder for metaplex"
rm -rf ./.cache
echo "[INFO] Uploading all resources"
metaplex upload ./nfts-sources --env mainnet-beta --keypair ~/.config/solana/candyfactory-mainnet.json > ./logs/main/upload-log.txt
echo "[INFO] Creating candy machine"
metaplex create_candy_machine --env mainnet-beta --keypair ~/.config/solana/candyfactory-mainnet.json --price 1 > ./logs/main/candy-machine-log.txt
echo "[INFO] Setting minting start date (goLiveDate)"
metaplex update_candy_machine -d "25 Sep 2021 00:00:00" --env mainnet-beta --keypair ~/.config/solana/candyfactory-mainnet.json > ./logs/main/candy-machine-start-date.txt
