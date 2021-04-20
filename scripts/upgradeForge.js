// TODO -- upgradeProxy should be moved to migration

// const proxy = await deployer.deploy(ProxyContract);
// const implementation1 = await deployer.deploy(ImplementationContract);

// await proxy.implement(implementation1.address);
// const proxyAsImpl = await ImplementationContract.at(proxy.address);

const ForgeToken = artifacts.require("ForgeToken");
const ForgeTokenV2 = artifacts.require("ForgeToken");

module.exports = async (callback) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const forge = await ForgeToken.at(
      "0xA3d85039287FcC632e060EDFc82B422Cd5cDe99f"
    );

    await upgradeProxy(forge.address, ForgeTokenV2, {
      admin: accounts[0],
      unsafeAllowCustomTypes: true,
    });

    callback();
  } catch (e) {
    callback(e);
  }
};
