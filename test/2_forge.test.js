const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const {
  // BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  // expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");

const DragunToken = artifacts.require("DragunToken");
const DWLD = artifacts.require("DWLD");

const ETH_FEE = web3.utils.toWei("0.02");
const DWLD_FEE = web3.utils.toWei("0.01");

const IPFS_HASH1 = "Qmbd1guB9bi3hKEYGGvQJYNvDUpCeuW3y4J7ydJtHfYMF6";
const IPFS_HASH2 = "QmTo5Vo3q2xF7Q4vCqkEN3iEuowVyo8rJtBXXQJw5rnXMB";

contract("Dragun Token", ([admin, alice, bob, feeRecipient, ...users]) => {
  let dwld, forge;

  before(async function () {
    dwld = await DWLD.new();

    // DEPLOY PROXY FORGE ERC1155
    forge = await deployProxy(
      DragunToken,
      [dwld.address, feeRecipient, ETH_FEE, DWLD_FEE],
      { admin, unsafeAllowCustomTypes: true }
    );

    // Fund users with DWLD tokens
    await dwld.mint(alice, web3.utils.toWei("1000"));
    await dwld.mint(bob, web3.utils.toWei("1000"));
  });

  describe("Initial Values", function () {
    it("should return correct ETH fee", async function () {
      const ethFee = await forge.ethFee();
      assert.equal(ethFee, ETH_FEE);
    });

    it("should return correct DWLD fee", async function () {
      const dwldFee = await forge.dwldFee();
      assert.equal(dwldFee, DWLD_FEE);
    });

    it("should return correct current token Id", async function () {
      const currentTokenId = await forge.currentTokenId();
      assert.equal(currentTokenId, 0);
    });

    it("should return correct current fee recipient", async function () {
      const _feeRecipient = await forge.feeRecipient();
      assert.equal(_feeRecipient, feeRecipient);
    });

    it("should return correct current dwld token address", async function () {
      const dwldAddress = await forge.dwld();
      assert.equal(dwldAddress, dwld.address);
    });
  });

  describe("Minting Tokens", function () {
    it("reverts when buying tokens without sending ETH in tx", async function () {
      const currentTime = await time.latest();

      await expectRevert(
        forge.buyWithETH(50, dwld.address, 2, currentTime + 10, IPFS_HASH1, {
          from: alice,
        }),
        "Not enough ETH sent"
      );
    });

    it("should buy 50 tokens using ETH", async function () {
      const currentTime = await time.latest();

      await forge.buyWithETH(50, dwld.address, 2, currentTime + 10, IPFS_HASH1, {
        from: alice,
        value: 50 * ETH_FEE,
      });

      const aliceBalance = await forge.balanceOf(alice, 0);
      assert.equal(aliceBalance, 50);
    });

    it("reverts when buying tokens without without approving DWLD first", async function () {
      const currentTime = await time.latest();

      await expectRevert(
        forge.buyWithDWLD(50, dwld.address, 2, currentTime + 10, IPFS_HASH1, {
          from: bob,
        }),
        "ERC20: transfer amount exceeds allowance"
      );
    });

    it("should buy 50 tokens using DWLD", async function () {
      const currentTime = await time.latest();

      await dwld.approve(forge.address, String(50 * DWLD_FEE), { from: bob });

      await forge.buyWithDWLD(
        50,
        constants.ZERO_ADDRESS,
        0,
        Number(currentTime) + 10,
        IPFS_HASH2,
        {
          from: bob,
        }
      );

      const bobBalance = await forge.balanceOf(bob, 1);
      assert.equal(bobBalance, 50);
    });

    it("should be able to transfer bought tokens to other users", async function () {
      for (let i = 0; i < 3; i++) {
        await forge.safeTransferFrom(alice, users[i], 0, 1, "0x", {
          from: alice,
        });

        let tokenBalance = await forge.balanceOf(users[i], 0);
        assert.equal(tokenBalance, 1);
      }

      for (let i = 0; i < 3; i++) {
        await forge.safeTransferFrom(bob, users[i], 1, 1, "0x", {
          from: bob,
        });

        let tokenBalance = await forge.balanceOf(users[i], 1);
        assert.equal(tokenBalance, 1);
      }
    });
  });

  describe("Burning Tokens", function () {
    it("newly minted tokens should not be burnable", async function () {
      const canBurn = await forge.canBurn(0, alice);
      assert(!canBurn);
    });

    it("should not be able to burn if user meets min balance", async function () {
      // Fund users with min balance (2 DWLD)
      for (let i = 0; i < 3; i++) {
        await dwld.mint(users[i], web3.utils.toWei("2"));
      }

      for (let i = 0; i < 3; i++) {
        const canBurn = await forge.canBurn(0, users[i]); // users do not have DWLD tokens yet
        assert(!canBurn);
      }
    });

    it("only burner role should be able to burn a token when DWLD min balance conditions is met", async function () {
      await expectRevert(
        forge.burnToken(0, users[0], { from: alice }),
        "Can't burn token yet"
      );

      await dwld.transfer(alice, web3.utils.toWei("2"), { from: users[0] });

      await expectRevert(
        forge.burnToken(0, users[0], { from: alice }),
        "Must have burner role"
      );

      // Add burner role
      await forge.grantRole(web3.utils.sha3("BURNER_ROLE"), admin, {
        from: admin,
      });

      // Burn token
      await forge.burnToken(0, users[0], { from: admin });
    });

    it("should be able to burn tokens in batch when it expires", async function () {
      await expectRevert(
        forge.burnToken(1, users[0], { from: admin }),
        "Can't burn token yet"
      );

      await time.increase(time.duration.seconds(10));
      await time.advanceBlock(1);

      // Burn token
      await forge.burnTokenBatch(
        Array(3).fill(1),
        [users[0], users[1], users[2]],
        { from: admin }
      );
    });
  });
});
