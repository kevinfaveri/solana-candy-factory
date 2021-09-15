const { default: Strapi } = require('strapi-sdk-javascript');
const fs = require('fs');
const readline = require("readline");

async function getShuffleOption() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question("Should shuffle option(n): ", function (value) {
      rl.close();
      resolve(value || 'n');
    });
  })
}

function shuffle(array) {
  var currentIndex = array.length, randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function generateNftsSources() {

  const files = fs.readdirSync('../nfts-sources')
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (!file.includes('.gitkeep'))
      fs.unlinkSync(`../nfts-sources/${file}`)
  }

  const strapi = new Strapi('http://localhost:1337');
  await strapi.login('admin', 'Admin123')

  let nfts = await strapi.getEntries('nf-ts')

  const suffleOption = await getShuffleOption()
  if (suffleOption === 'y') shuffle(nfts)

  for (let index = 0; index < nfts.length; index++) {
    const nft = nfts[index];
    const jsonFile = {
      name: nft.name,
      symbol: nft.symbol,
      description: nft.description,
      seller_fee_basis_points: nft.seller_fee_basis_points,
      image: nft.image,
      external_url: nft.external_url,
      attributes: nft.traits.attributes,
      collection: {
        name: nft.collection_id.name,
        family: nft.collection_id.family,
      },
      properties: nft.properties
    }
    fs.copyFileSync(`./public${nft.content.url}`, `../nfts-sources/${index}.png`)
    fs.writeFileSync(`../nfts-sources/${index}.json`, JSON.stringify(jsonFile))
  }
}

generateNftsSources()

