const ForgeToken = artifacts.require("ForgeToken");

//truffle exec scripts/transferNFT.js 0x2DfC59f70826281BC2EE0bE2E4FAA59DE33e3622 0 --network rinkeby

module.exports = async (callback) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const forge = await ForgeToken.at(
      "0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7"
    );

    const to = process.argv[4];
    const tokenId = process.argv[5];

    console.log(`Transfering 1 NFT of id #${tokenId} to ${to} `);
    await forge.safeTransferFrom(accounts[0], to, tokenId, 1, "0x");
    const balance = await forge.balanceOf(to, tokenId);
    console.log(`Done! New Balance: ${String(balance)} NFT id #${tokenId}`);

    callback();
  } catch (e) {
    callback(e);
  }
};

// ganache
// truffle exec scripts/transferNFT.js 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b 0
