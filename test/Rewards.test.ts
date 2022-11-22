import { expect } from "chai";
import { REWARDS } from "../helpers/constants";
import { Epochs } from "../typechain-types";
import { makeTestsEnv } from "./helpers/make-tests-env";
import { mineBlocks } from "../helpers/misc-utils";
import { parseEther } from "ethers/lib/utils";

makeTestsEnv(REWARDS, (testEnv) => {

  async function forwardEpochs(epochs: Epochs, quantity: number) {
    let epochDuration = await epochs.epochDuration();
    let blockQuantity = epochDuration.toNumber() * quantity;
    await mineBlocks(blockQuantity);
  }

  describe("individualRewards", async () => {
    it("single player scenario", async function () {
      const { epochs, glmDeposits, rewards, tracker, signers, token, beaconChainOracle, executionLayerOracle } = testEnv;
      await token.transfer(signers.Alice.address, parseEther("1000000"));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther("1000000"));
      await glmDeposits.connect(signers.Alice).deposit(parseEther("1000000"));
      await forwardEpochs(epochs, 2);
      await beaconChainOracle.setBalance(1, parseEther("200"))
      await executionLayerOracle.setBalance(1, parseEther("200"))
      await beaconChainOracle.setBalance(2, parseEther("400"))
      await executionLayerOracle.setBalance(2, parseEther("400"))
      expect(await tracker.totalDepositAt(2), "total deposit").eq(parseEther("1000000"));
      expect(await rewards.stakedRatio(2), "staked ratio").eq(parseEther("0.001"));
      expect(await rewards.allIndividualRewards(2), "sum of IRs").eq(parseEther("0.4"));
      expect(await rewards.individualReward(2, signers.Alice.address), "Alice IR").eq(parseEther("0.4"));
    });

    it("multiplayer scenario", async function () {
      const { epochs, glmDeposits, rewards, tracker, signers, token, beaconChainOracle, executionLayerOracle } = testEnv;
      await token.transfer(signers.Alice.address, parseEther("1000000"));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther("1000000"));
      await glmDeposits.connect(signers.Alice).deposit(parseEther("1000000"));
      await token.transfer(signers.Bob.address, parseEther("500000"));
      await token.connect(signers.Bob).approve(glmDeposits.address, parseEther("500000"));
      await glmDeposits.connect(signers.Bob).deposit(parseEther("500000"));
      await forwardEpochs(epochs, 2);
      await beaconChainOracle.setBalance(1, parseEther("200"))
      await executionLayerOracle.setBalance(1, parseEther("200"))
      await beaconChainOracle.setBalance(2, parseEther("400"))
      await executionLayerOracle.setBalance(2, parseEther("400"))
      expect(await tracker.totalDepositAt(2), "total deposit").eq(parseEther("1500000"));
      expect(await rewards.stakedRatio(2), "staked ratio").eq(parseEther("0.0015"));
      expect(await rewards.allIndividualRewards(2), "sum of IRs").eq(parseEther("0.6"));
      expect(await rewards.individualReward(2, signers.Alice.address), "Alice IR").eq(parseEther("0.4"));
      expect(await rewards.individualReward(2, signers.Bob.address), "Bob IR").eq(parseEther("0.2"));
    });
  });
});
