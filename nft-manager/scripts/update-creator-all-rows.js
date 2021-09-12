const { default: Strapi } = require('strapi-sdk-javascript');
const readline = require("readline");

async function getCreatorAddress() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question("Type the address to replace everyone: ", function (value) {
      rl.close();
      resolve(value);
    });
  })
}

async function getSellerFee() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question("Type percent the creators earn for each sell (%): ", function (value) {
      rl.close();
      resolve(isNaN(value) ? null : Number(value) * 100);
    });
  })
}

async function updateCreatorAllRows() {
  const strapi = new Strapi('http://localhost:1337');
  await strapi.login('admin', 'Admin123')

  const creatorAddress = await getCreatorAddress()
  const seller_fee_basis_points = await getSellerFee()

  const nfts = await strapi.getEntries('nf-ts')
  for (let index = 0; index < nfts.length; index++) {
    const nft = nfts[index];

    const properties = {
      ...nft.properties, creators: [{
        "address": creatorAddress || nft.properties.creators[0].address,
        "share": 100
      }]
    }

    await strapi.updateEntry('nf-ts', nft.id, { properties, seller_fee_basis_points: seller_fee_basis_points || nft.seller_fee_basis_points })
  }
}

updateCreatorAllRows()

