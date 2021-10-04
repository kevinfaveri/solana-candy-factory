First of all, it is blockchain: don't despair, all data is public.

# Common problems

## Initializing Config Timeout Error

When uploading NFT's using the metaplex candy machine cli upload command (using the metaplex upload command) a timeout might occur:

```bash
Beginning the upload for X (png+json) pairs
started at: 1633215785473
wallet public key: KEY
Processing file: 0
initializing config
Translating error Error: Transaction was not confirmed in 60.00 seconds. It is unknown if it succeeded or failed. Check signature HASH_HERE using the Solana Explorer or CLI tools.
```

You may become scared because your deployment wallet has been wiped out of funds for deploymnet and running the metaplex upload command does nothing! Fear not, you are on a public blockchain. 

So, let's fix this: get your signature hash (the HASH_HERE) from the outputted message above and create this link replacing the placeholder, obviously: https://solscan.io/tx/HASH_HERE

You will see in this page two instructions details, `Create Account` and `Instruction 1`. You need to pay attention to the `Create Account` one, which has probably four `Input Accounts`. 

Grab the value for first two values (`NewAccount`, and `Source`) and store them somewhere. 


Now, on your project where you are deploying your candy machine and inside the `.cache` folder, create a file named `mainnet-beta-temp` (without any extension). 

Finally, have the content of it be something like this, properly replacing the `uuid`, `config` and `authority` keys but the values you grabbed above:

```json
{
   "program":{
      "uuid":"First 6 Characters of the NewAccount value",
      "config":"NewAccount Value"
   },
   "items":{
      
   },
   "env":"mainnet-beta",
   "cacheName":"temp",
   "authority":"Source Value"
}

```

Aaaand... it's done! You are good to go now, just re-rerun the upload command and it should resume from where it failed.
