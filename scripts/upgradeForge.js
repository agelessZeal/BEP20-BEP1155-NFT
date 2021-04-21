// TODO -- upgradeProxy should be moved to migration

// const proxy = await deployer.deploy(ProxyContract);
// const implementation1 = await deployer.deploy(ImplementationContract);

// await proxy.implement(implementation1.address);
// const proxyAsImpl = await ImplementationContract.at(proxy.address);

const DragunToken = artifacts.require("DragunToken");
const DragunTokenV2 = artifacts.require("DragunToken");

module.exports = async (callback) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const dragun = await DragunToken.at(
      "0xA3d85039287FcC632e060EDFc82B422Cd5cDe99f"
    );

    await upgradeProxy(dragun.address, DragunTokenV2, {
      admin: accounts[0],
      unsafeAllowCustomTypes: true,
    });

    callback();
  } catch (e) {
    callback(e);
  }
};
