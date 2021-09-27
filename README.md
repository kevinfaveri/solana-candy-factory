# NFT Candy Factory

NOTE: This repo will prob only work on unix-based environments.

The NFT Candy Factory project is designed to let users fork, customize, and deploy their own candy machine mint app to a custom domain, ultra fast.

A candy machine is an on-chain Solana program for managing fair mint. Fair mints:
* Start and finish at the same time for everyone.
* Won't accept your funds if they're out of NFTs to sell.

It builds on top of the the work started at https://github.com/exiled-apes/candy-machine-mint, abstracting away a few things (like having one-command shortcuts in the package.json that instantly setups dev env), improving DX and adding new tools for managing the source files. 

Techwise, it builds on top of NextJS and TailwindCSS for the frontend (as well as Solana Labs toolchain and Serum Anchor libs for interacting with the Solana network); and Metaplex and Solana clis for deployment on the Solana network. It also adds Strapi as the `nft-manager` which is in reality used just as a UI for managing the JSON and PNG files. More details below.

## Step-by-step tutorial

Check out this awesome guide by @nheingit which uses this repo and teaches how to ship your own Candy Machine: https://www.quicknode.com/guides/web3-sdks/how-to-mint-an-nft-on-solana-using-candy-machine

## Getting Set Up

### Prerequisites

* Ensure you have recent versions of both `node` and `yarn` installed.

* Follow the instructions [here](https://docs.solana.com/cli/install-solana-cli-tools) to install the Solana Command Line Toolkit.

* Follow the instructions [here](https://hackmd.io/@levicook/HJcDneEWF) to install the Metaplex Command Line Utility.
  * Installing the Command Line Package is currently an advanced task that will be simplified eventually.

## NFT Manager

*! NOTE*: Be sure to an instance of postgresql running on port 6432. For ease of use, one is provided using docker + docker-compose by running `yarn start-nft-manager-db`

This repo features an NFT manager so you do not need to create all nfts by editing a JSON file that is powered by Strapi. Just run `yarn nft-manager` and add:
- A collection
- An NFT that links to that collection

*! NOTE*: Be sure to create an user, after you login with the admin account, that has the role "authenticated", username "admin" and pass "Admin123", as well as add all collections and upload related permissions to the "authenticated" role; otherwise, the `yarn update-creator-all-rows` and `yarn generate-nft-sources` commands will not work.

Then you are good to go: run `yarn generate-nft-sources` for generating the JSON and PNG files in the `nfts-sources` folder in the root of the project. Following that, you can go for deployment on production (section below) OR test it in dev using `yarn setup-dev`.

### NFT Manager form default values

You are able to change the NFT manager form default values by editing the file `./nft-manager/api/nf-ts/models/nf-ts.settings.json`.

## Available Scripts

In the project root directory, you can run:

* `yarn nft-manager` -- Setup development server of the NFT-Manager, which is a UI for managing all NFTs.

*! -* The following commands of the nft-manager needs the nft-manager running, so be sure to run `yarn nft-manager` before running them:

* `yarn update-creator-all-rows` -- Set a new creator address to all NFT rows
* `yarn generate-nfts-sources` -- Generate nft source files based on the nft-manager data; allow to generate randomized or DB index order

---

* `yarn setup-dev` -- Setup development environment: needs solana and metaplex cli installed (it will create a new Solana wallet, drop some sols there, and upload the resources to the devnet Metaplex program, making it ready to test using yarn dev...). This command automatically generates the `.env.local` file for you with the start date, candy machine addresses, and treasury addresses.


Note: you still need to run yarn generate-nfts-sources for it to work. 

*ALERT*: Running this command will replace your Solana devwallet generated before at `~/.config/solana/candyfactory-devnet.json` as well as all previous environment stuff you had, like your `.env.local`. It is a nuke solution for resetting development environment. If you already have the setup done use the scripts declared in this command or tweak them (they are available in the `devtools` folder in the root of the project)
* `yarn dev` -- Run NextJS devserver; it features a modal for connecting with Phantom, Solflare and Sollet (more can be added using the Solana Labs wallet library); minting of the NFT; success/error messages; and UI countdown based on the candy machine start date.

---

* `yarn deploy-mainnet` -- Setup production environment: needs Solana and Metaplex cli installed. Refer to the #Deployment section below. 
* `yarn build` -- Bundle for production environment
* `yarn start` -- Start production build project

## Deployment

- Don't forget to use the wallet you want to earn the mint value for both metaplex uploading (`yarn deploy-mainnet`) and in the NFT's creators.address[0] (NFT-Manager properties editor of a specific NFT) for earning the royaties.
- You still need to run `yarn generate-nfts-sources` if you have not created the source files yet
- You should have all your NFTs ready before deploying. Incremental deploying of NFTs is not supported right now. Feel free to add a PR tho if you find a solution for this

For deploying your collection on the mainnet just run `yarn deploy-mainnet` and answer the questions as prompted. It will store your wallet key in our path: `~/.config/solana/candyfactory-mainnet.json` (if you want to edit that just tweak setup-solana-mainnet.sh). It is the same process as used for the development environment but asking for importing a Wallet PK (that should have enough SOLs and will be the one that will receive the mint value). 

After the deployment is over, it will generate all envs that your frontend dApp needs in a file called `.env.local.production` in the root of the project. These env values should then be added as environment variables where you build your dAapp (if Vercel, you need to add to their `ENVIROMENT VARIABLES` config section).

## Donate

The best way to support me is by minting one city at the project that started it all: https://worldcities.aiphotos.art/

Also, if possible, follow me on [https://twitter.com/kevinfaveri_](https://twitter.com/kevinfaveri_) and [https://twitter.com/aiphotos_](https://twitter.com/aiphotos_) (which is the art project that inspired this repository) :)

## Hire

If you want to hire me to develop your candy machine application on the Solana or Ethereum blockchain feel free to reach me through the email kevin@faveri.dev
