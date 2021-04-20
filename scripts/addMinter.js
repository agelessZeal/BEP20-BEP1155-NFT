const DragunToken = artifacts.require("DragunToken");

//truffle exec scripts/addMinter.js 0x5336fc5d057d422c8b7b51cd50285fce0b81196d --network matic
module.exports = async (callback) => {
  try {
    const dragunToken = await DragunToken.at(
      "0xA3d85039287FcC632e060EDFc82B422Cd5cDe99f"
    );

    const address = process.argv[4];

    console.log(`Adding ${address} as burner role`);
    await dragunToken.grantRole(web3.utils.sha3("BURNER_ROLE"), address);
    const hasRole = await dragunToken.hasRole(
      web3.utils.sha3("BURNER_ROLE"),
      address
    );
    console.log(`Success? ${hasRole}`);

    callback();
  } catch (e) {
    callback(e);
  }
};
