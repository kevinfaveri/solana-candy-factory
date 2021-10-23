# NFT Candy Factory

##### Read this if you are coming from the Quicknode guide

Currently, this repo has been reworked to represent its new goals. However, we still have some major guides in the ecosystem using the old version as reference. So, I've created a new branch from before the rework if you want to use: https://github.com/kevinfaveri/solana-candy-factory/tree/old_repo

##### I'm brainstorming a few ideas at [IDEAS](./IDEAS.MD) and [PROGRAM IDEAS](./PROGRAM_IDEAS.MD) if you want to collaborate.

NOTE: This repo will prob only work on unix-based environments.

The NFT Candy Factory project is designed to let users fork, customize, and deploy their own candy machine mint app to a custom domain, ultra fast.

A candy machine is an on-chain Solana program for managing fair mint. Fair mints:
* Start and finish at the same time for everyone.
* Won't accept your funds if they're out of NFTs to sell.

It builds on top of the the work started at https://github.com/exiled-apes/candy-machine-mint, abstracting away a few things (like having one-command shortcuts in the package.json that instantly setups dev env), improving DX and adding new tools for managing the source files. It also features some other features:
- Listing of NFTs of the collection
- A tool for getting the mint hashes
- A tool for getting the list of holders
- Multiple mint in the same prompt
- ReCaptcha support

Techwise, it builds on top of NextJS and TailwindCSS for the frontend (as well as Solana Labs toolchain and Serum Anchor libs for interacting with the Solana network); and Metaplex and Solana clis for deployment on the Solana network.

## Getting Set Up

### Prerequisites

* Ensure you have recent versions of both `node` and `yarn` installed.

* Follow the instructions [here](https://docs.solana.com/cli/install-solana-cli-tools) to install the Solana Command Line Toolkit.

* Follow the instructions [here](https://hackmd.io/@levicook/HJcDneEWF) to install the Metaplex Command Line Utility.
  * Installing the Command Line Package is currently an advanced task that will be simplified eventually.

## Advanced Features

### ReCaptcha

For adding support for recaptcha just add the NEXT_PUBLIC_RECAPTCHA_KEY (client key) and RECAPTCHA_SECRET (server secret key) keys to your `.env` file in which the value will be your recaptcha client side key. You can generate them using your Google account: https://www.google.com/recaptcha/about/

If you do not want to use ReCaptcha, then just use a plain button and not the ReCaptcha button component.

## Devnnet

In the project root directory, you can run:

* `yarn setup-dev` -- Setup development environment: needs solana and metaplex cli installed (it will create a new Solana wallet, drop some sols there, and upload the resources to the devnet Metaplex program, making it ready to test using yarn dev...). This command automatically generates the `.env.local` file for you with the start date, candy machine addresses, and treasury addresses.


Note: You will still need to generate NFT sources and place in the 'nft-sources' folder. There are a few examples in this repository. They should always start with 0.json and 0.png.

*ALERT*: Running this command will replace your Solana devwallet generated before at `~/.config/solana/candyfactory-devnet.json` as well as all previous environment stuff you had, like your `.env.local`. It is a nuke solution for resetting development environment. The source scripts are available in the `devtools` folder in the root of the project. So, if something goes wrong, go into this folder and try running each command a time.

After your Devnnet candy machine has been created feel free to run:
* `yarn dev` -- Run NextJS devserver; it features a modal for connecting with wallets; minting of the NFT; success/error messages; and UI countdown based on the candy machine start date.

## Mainnet

- You can't incrementally upload in batches your NFTs. You should do it in one go, always. If you update your batch, you will need to upload it all again. The way to do this then will be to delete the candy machine folder.
- Don't forget to use the wallet you want to earn the mint value for both metaplex uploading (`yarn deploy-mainnet`) and in the NFT's creators.address[0] for earning the royaties.
- You should have all your NFTs ready before deploying. Incremental deploying of NFTs is not supported right now. Feel free to add a PR tho if you find a solution for this

For deploying your collection on the mainnet just run `yarn deploy-mainnet` and answer the questions as prompted. It will store your wallet key in our path: `~/.config/solana/candyfactory-mainnet.json` (if you want to edit that just tweak setup-solana-mainnet.sh). It is the same process as used for the development environment but asking for importing a Wallet PK (that should have enough SOLs and will be the one that will receive the mint value). 

After the deployment is over, it will generate all envs that your frontend dApp needs in a file called `.env.local.production` in the root of the project. These env values should then be added as environment variables where you build your dAapp (if Vercel, you need to add to their `ENVIROMENT VARIABLES` config section).

## Donate

The best way to support me is by following me on [https://twitter.com/kevinfaveri_](https://twitter.com/kevinfaveri_) and [https://twitter.com/aiphotos_](https://twitter.com/aiphotos_) (which is the art project that inspired this repository) :)

## Others Tools

If you want multisig wallets, you may study https://github.com/GokiProtocol/goki or the https://github.com/project-serum/multisig.

Also, a ton of other useful tools/repos:
https://github.com/HashLips/hashlips_art_engine

https://github.com/exiled-apes/candy-machine-mint

https://github.com/InnerMindDAO/MintUI (GUI for the Candy Machine)

https://github.com/theskeletoncrew/treat-toolbox (WebApp for creating collections + Candy Machine without the candy machine cli overhead)

https://github.com/maxwellfortney/next-candy-machine (More simplified version of this repo)

https://github.com/samuelvanderwaal/metaboss (CLI with useful tools for Metaplex)

## Hire

If you want to hire me to develop your candy machine application on the Solana or Ethereum blockchain feel free to reach me through the email kevin@faveri.dev
