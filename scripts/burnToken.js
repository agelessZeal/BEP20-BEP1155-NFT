const DragunToken = artifacts.require("DragunToken");

//truffle exec scripts/burnToken.js 0xB29aE9a9BF7CA2984a6a09939e49d9Cf46AB0c1d 0 --network rinkeby

module.exports = async (callback) => {
  try {
    const forge = await DragunToken.at(
      "0x4359C08b706B6BD92E2991d7cD143C5894d1a02f"
    );

    const user = process.argv[4];
    const tokenId = process.argv[5];

    const canBurn = await forge.canBurn(tokenId, user);

    if (!canBurn) throw new Error("Can't burn token from this user!");

    console.log(`Burning NFT with id ${tokenId} from ${user} `);
    await forge.burnToken(tokenId, user);

    callback();
  } catch (e) {
    callback(e);
  }
};
