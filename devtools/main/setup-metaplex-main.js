const fs = require('fs');
const readline = require("readline");
const shelljs = require('shelljs')

async function getMintPrice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question("Type mint price [default 1 sol]: ", function (value) {
      rl.close();
      resolve(value);
    });
  })
}

async function getStartDate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question("Type start date of the minting [default 25 Sep 2021 00:00:00 UTC]: ", function (value) {
      rl.close();
      resolve(value);
    });
  })
}

async function setupMetaplexDev() {
  const file = fs.readFileSync('./devtools/main/setup-metaplex-main.sh')
  const fileContent = file.toString()
  const splittedContent = fileContent.split('\n')
  const mintPrice = await getMintPrice()
  fs.writeFileSync(`${__dirname}/../../logs/main/mint-price.txt`, String(mintPrice))
  splittedContent[5] = `ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts create_candy_machine --env mainnet-beta --keypair ~/.config/solana/candyfactory-mainnet.json --price ${mintPrice || 1} > ./logs/main/candy-machine-log.txt`

  const startDate = await getStartDate()
  splittedContent[7] = `ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts update_candy_machine -d "${startDate || '25 Sep 2021 00:00:00 UTC'}" --env mainnet-beta --keypair ~/.config/solana/candyfactory-mainnet.json > ./logs/main/candy-machine-start-date.txt`

  fs.unlinkSync('./devtools/main/setup-metaplex-main.sh')
  fs.writeFileSync('./devtools/main/setup-metaplex-main.sh', splittedContent.join(`\n`))
  shelljs.exec('sh ./devtools/main/setup-metaplex-main.sh')
}

setupMetaplexDev()

