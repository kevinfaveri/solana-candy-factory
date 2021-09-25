const fs = require('fs')
const path = require('path')
const envfile = require('envfile')
const templateEnvFile = envfile.parse(fs.readFileSync('./.env.template').toString())

let NEXT_PUBLIC_CANDY_MACHINE_ID, NEXT_PUBLIC_CANDY_START_DATE, NEXT_PUBLIC_TREASURY_ADDRESS, NEXT_PUBLIC_CANDY_MACHINE_CONFIG

fs.readdir('./logs/main/', (err, files) => {
  if (err) {
    console.log(err);
  }

  files.forEach(file => {
    const fileDir = path.join('./logs/main/', file);
    if (fileDir.includes('candy-machine-log.txt')) {
      const fileContent = fs.readFileSync(fileDir);
      NEXT_PUBLIC_CANDY_MACHINE_ID = fileContent
        .toString()
        .split('\n')[1]
        .trim()
        .replace('create_candy_machine finished. candy machine pubkey: ', '');
    }

    if (fileDir.includes('candy-machine-start-date.txt')) {
      const fileContent = fs.readFileSync(fileDir);
      const fragment = fileContent.toString().split('\n')[1].trim().replace('- updated startDate timestamp:', '')
      const candyMachineStartDate = fragment.split(' ')[1]
      NEXT_PUBLIC_CANDY_START_DATE = candyMachineStartDate * 1000;
    }


    if (fileDir.includes('wallet-log.txt')) {
      const fileContent = fs.readFileSync(fileDir);
      NEXT_PUBLIC_TREASURY_ADDRESS = fileContent;
    }
  });

  const metaplexTempFile = fs.readFileSync('./.cache/mainnet-beta-temp');
  const metaplexTempFileJSON = JSON.parse(metaplexTempFile.toString())
  NEXT_PUBLIC_CANDY_MACHINE_CONFIG = metaplexTempFileJSON.program.config

  const generatedConfig = {
    ...templateEnvFile,
    NEXT_PUBLIC_CANDY_MACHINE_ID,
    NEXT_PUBLIC_CANDY_START_DATE,
    NEXT_PUBLIC_TREASURY_ADDRESS,
    NEXT_PUBLIC_CANDY_MACHINE_CONFIG,
    NEXT_PUBLIC_SOLANA_NETWORK: 'mainnet-beta',
    NEXT_PUBLIC_SOLANA_RPC_HOST: 'https://solana-api.projectserum.com'

  }
  fs.writeFileSync('./.env.local.production', envfile.stringify(generatedConfig))
});