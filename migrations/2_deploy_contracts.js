const {
  deployProxy,
  silenceWarnings,
} = require("@openzeppelin/truffle-upgrades");

const DragunToken = artifacts.require("DragunToken");
const DWLD = artifacts.require("DWLD");

const ETH_FEE = web3.utils.toWei("10");
const DWLD_FEE = web3.utils.toWei("0.005");

const FEE_RECIPIENT = "0x2402aa453F593fF39f443B177c84413b7Eb7971D";

const APP_URL = "https://dragun.world/";

module.exports = async function (deployer, network, accounts) {
  if (network === "test") return;

  silenceWarnings();

  // DEPLOY PROXY DWLD ERC20
  await deployer.deploy(DWLD);
  const dwldToken = await DWLD.deployed();

  if (network === "development")
    dwldToken.mint(accounts[0], web3.utils.toWei("1000"));

  // DEPLOY PROXY DRAGUN ERC1155
  const dragunToken = await deployProxy(
    DragunToken,
    [dwldToken.address, FEE_RECIPIENT, ETH_FEE, DWLD_FEE],
    { deployer, unsafeAllowCustomTypes: true }
  );

  await dragunToken.setContractURI(APP_URL);

  console.log("Deployed Dragun", dragunToken.address);

  console.log("Granting Burner Role to Accounts 0");
  await dragunToken.grantRole(web3.utils.sha3("BURNER_ROLE"), accounts[0]);
};
