const fs = require('fs')
const path = require('path')
const envfile = require('envfile')
const templateEnvFile = envfile.parse(fs.readFileSync('./.env.template').toString())

let NEXT_PUBLIC_CANDY_MACHINE_ID, NEXT_PUBLIC_CANDY_START_DATE, NEXT_PUBLIC_TREASURY_ADDRESS, NEXT_PUBLIC_CANDY_MACHINE_CONFIG

fs.readdir('./logs/dev/', (err, files) => {
  if (err) {
    console.log(err);
  }

  files.forEach(file => {
    const fileDir = path.join('./logs/dev/', file);
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

    if (fileDir.includes('new-wallet-log.txt')) {
      const fileContent = fs.readFileSync(fileDir);
      NEXT_PUBLIC_TREASURY_ADDRESS = fileContent.toString().split('\n')[4].split(' ')[1].trim();
    }
  });

  const metaplexTempFile = fs.readFileSync('./.cache/devnet-temp');
  const metaplexTempFileJSON = JSON.parse(metaplexTempFile.toString())
  NEXT_PUBLIC_CANDY_MACHINE_CONFIG = metaplexTempFileJSON.program.config

  const generatedConfig = {
    ...templateEnvFile,
    NEXT_PUBLIC_CANDY_MACHINE_ID,
    NEXT_PUBLIC_CANDY_START_DATE,
    NEXT_PUBLIC_TREASURY_ADDRESS,
    NEXT_PUBLIC_CANDY_MACHINE_CONFIG
  }
  fs.writeFileSync('./.env.local', envfile.stringify(generatedConfig))
});