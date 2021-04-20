const {
  deployProxy,
  silenceWarnings,
} = require("@openzeppelin/truffle-upgrades");

const ForgeToken = artifacts.require("ForgeToken");
const ZUT = artifacts.require("ZUT");

const ETH_FEE = web3.utils.toWei("10");
const ZUT_FEE = web3.utils.toWei("0.005");

const FEE_RECIPIENT = "0x8Aa0B4FB0d0E1bB95959BaE95F81D71D1c6b6fF7";

const APP_URL = "https://nftminter.zeroutility.com/";

module.exports = async function (deployer, network, accounts) {
  if (network === "test") return;

  silenceWarnings();

  // DEPLOY PROXY ZUT ERC20
  await deployer.deploy(ZUT);
  const zutToken = await ZUT.deployed();

  if (network === "development")
    zutToken.mint(accounts[0], web3.utils.toWei("1000"));

  // DEPLOY PROXY FORGE ERC1155
  const forgeToken = await deployProxy(
    ForgeToken,
    [zutToken.address, FEE_RECIPIENT, ETH_FEE, ZUT_FEE],
    { deployer, unsafeAllowCustomTypes: true }
  );

  await forgeToken.setContractURI(APP_URL);

  console.log("Deployed Forge", forgeToken.address);

  console.log("Granting Burner Role to Accounts 0");
  await forgeToken.grantRole(web3.utils.sha3("BURNER_ROLE"), accounts[0]);
};
