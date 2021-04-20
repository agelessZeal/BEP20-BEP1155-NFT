const ZUT = artifacts.require("ZUT");

//truffle exec scripts/mintZut.js 0x2DfC59f70826281BC2EE0bE2E4FAA59DE33e3622 1000 --network rinkeby
//truffle exec scripts/mintZut.js 0xB29aE9a9BF7CA2984a6a09939e49d9Cf46AB0c1d 1000 --network rinkeby
module.exports = async (callback) => {
  try {
    const zut = await ZUT.deployed();

    const address = process.argv[4];
    const amount = web3.utils.toWei(process.argv[5]);

    console.log(`Minting ${process.argv[5]} ZUT to ${address} `);
    await zut.mint(address, amount);
    const balance = await zut.balanceOf(address);
    console.log(
      `Done! New Balance: ${web3.utils.fromWei(String(balance))} ZUT`
    );

    callback();
  } catch (e) {
    callback(e);
  }
};
