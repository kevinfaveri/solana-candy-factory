echo "[INFO] Cleaning older cache folder for metaplex"
rm -rf ./.cache
echo "[INFO] Uploading all resources"
metaplex upload ./nfts-sources --env devnet --keypair ~/.config/solana/candyfactory-devnet.json > ./logs/dev/upload-log.txt
echo "[INFO] Creating candy machine"
metaplex create_candy_machine --env devnet --keypair ~/.config/solana/candyfactory-devnet.json --price 1 > ./logs/dev/candy-machine-log.txt
echo "[INFO] Setting minting start date (goLiveDate)"
metaplex set_start_date -d "09 Sep 2021 16:00:00" --env devnet --keypair ~/.config/solana/candyfactory-devnet.json > ./logs/dev/candy-machine-start-date.txt
