const {
  deployProxy,
  upgradeProxy,
  silenceWarnings,
} = require("@openzeppelin/truffle-upgrades");

const DragunToken = artifacts.require("DragunToken");
const ForgeTokenV2 = artifacts.require("ForgeTokenV2");
const DWLD = artifacts.require("DWLD");

const ETH_FEE = web3.utils.toWei("0.02");
const DWLD_FEE = web3.utils.toWei("0.03");

contract("Upgradeability", ([admin, alice, bob, feeRecipient]) => {
  let dwld, dragun;

  silenceWarnings();

  describe("Deployment", function () {
    it("should be able to deploy DWLD ERC20", async function () {
      dwld = await DWLD.new();
    });

    it("should be able to deploy Dragun proxy ERC1155", async function () {
      dragun = await deployProxy(
        DragunToken,
        [dwld.address, feeRecipient, ETH_FEE, DWLD_FEE],
        { admin, unsafeAllowCustomTypes: true }
      );
    });
  });

  describe("Initial Values", function () {
    it("should return correct ETH fee", async function () {
      const ethFee = await dragun.ethFee();
      assert.equal(ethFee, ETH_FEE);
    });

    it("should return correct DWLD fee", async function () {
      const dwldFee = await dragun.dwldFee();
      assert.equal(dwldFee, DWLD_FEE);
    });
  });

  describe("Upgrade", function () {
    it("should upgrade contract to V2 by admin", async function () {
      dragun = await upgradeProxy(dragun.address, ForgeTokenV2, {
        admin,
        unsafeAllowCustomTypes: true,
      });
    });

    it("should return correct ETH fee after upgrade", async function () {
      const ethFee = await dragun.ethFee();
      assert.equal(ethFee, ETH_FEE);
    });

    it("should return correct DWLD fee after upgrade", async function () {
      const dwldFee = await dragun.dwldFee();
      assert.equal(dwldFee, DWLD_FEE);
    });
  });
});
