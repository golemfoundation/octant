import { expect } from 'chai';
import chai from 'chai';
import { smock } from '@defi-wonderland/smock';
import { ethers } from 'hardhat';
import { parseEther } from 'ethers/lib/utils';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, REWARDS, TEST_REWARDS } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { makeTestsEnv } from './helpers/make-tests-env';
import { Allocations, AllocationsStorage, Epochs, Tracker } from '../typechain-types';

let ZeroAddr = '0x0000000000000000000000000000000000000000';

makeTestsEnv(REWARDS, (testEnv) => {

  describe("individualReward", async () => {
    it("TestRewards", async () => {
      const { testRewards, signers } = testEnv;
      expect(await testRewards.individualReward(1, signers.Alice.address)).eq(parseEther("0.4"));
    });

    it("TestRewards", async () => {
      const { epochs, proposals, tracker, signers: { Alice } } = testEnv;

      let sTracker = await smock.fake<Tracker>('Tracker');
      sTracker.depositAt.returns((_owner, _epochNo) => {
        return 1;
      });
      const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
      const allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
      const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);
      const allocations: Allocations = await allocationsFactory.deploy(epochs.address, allocationsStorage.address, sTracker.address) as Allocations;
      await allocationsStorage.transferOwnership(allocations.address);

      const testRewardsFactory = await ethers.getContractFactory(TEST_REWARDS);
      const testRewards = await testRewardsFactory.deploy(epochs.address, ZeroAddr, tracker.address, ZeroAddr, proposals.address, allocationsStorage.address);

      await forwardEpochs(epochs, 1);
      await allocations.connect(Alice).vote(1, 50);
      const result = await testRewards.matchedProposalRewards(1);
      expect(result[0].donated).eq(parseEther("0.2"));
      expect(result[0].matched).eq(parseEther("40.407017003965518800"));
    });

    it("single player scenario", async function () {
      const { epochs, glmDeposits, rewards, tracker, signers, token, beaconChainOracle, executionLayerOracle } = testEnv;
      await token.transfer(signers.Alice.address, parseEther("1000000"));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther("1000000"));
      await glmDeposits.connect(signers.Alice).deposit(parseEther("1000000"));
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(1, parseEther("200"))
      await executionLayerOracle.setBalance(1, parseEther("200"))
      await forwardEpochs(epochs, 1);
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
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(1, parseEther("200"))
      await executionLayerOracle.setBalance(1, parseEther("200"))
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(2, parseEther("400"))
      await executionLayerOracle.setBalance(2, parseEther("400"))
      expect(await tracker.totalDepositAt(2), "total deposit").eq(parseEther("1500000"));
      expect(await rewards.stakedRatio(2), "staked ratio").eq(parseEther("0.0015"));
      expect(await rewards.allIndividualRewards(2), "sum of IRs").eq(parseEther("0.6"));
      expect(await rewards.individualReward(2, signers.Alice.address), "Alice IR").eq(parseEther("0.4"));
      expect(await rewards.individualReward(2, signers.Bob.address), "Bob IR").eq(parseEther("0.2"));
    });
  });

  describe("totalRewards", async () => {
    it("Compute total rewards", async function () {
      const { epochs, glmDeposits, rewards, signers, token, beaconChainOracle, executionLayerOracle } = testEnv;
      await token.transfer(signers.Alice.address, parseEther("1000000"));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther("1000000"));
      await glmDeposits.connect(signers.Alice).deposit(parseEther("1000000"));
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(1, parseEther("200"))
      await executionLayerOracle.setBalance(1, parseEther("200"))
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(2, parseEther("400"))
      await executionLayerOracle.setBalance(2, parseEther("400"))
      expect(await rewards.totalRewards(2), "sum of TRs").eq(parseEther("12.6491106406735172"));
    });
  });

  describe('Proposal rewards', async () => {
    beforeEach(async () => {
      const {
        epochs,
        glmDeposits,
        allocations,
        signers: { Alice, Bob, Charlie, Eve },
        token,
        beaconChainOracle,
        executionLayerOracle
      } = testEnv;

      // Users deposit
      await token.transfer(Alice.address, parseEther('1000000'));
      await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(Alice).deposit(parseEther('1000000'));

      await token.transfer(Bob.address, parseEther('500000'));
      await token.connect(Bob).approve(glmDeposits.address, parseEther('500000'));
      await glmDeposits.connect(Bob).deposit(parseEther('500000'));

      await token.transfer(Charlie.address, parseEther('2000000'));
      await token.connect(Charlie).approve(glmDeposits.address, parseEther('2000000'));
      await glmDeposits.connect(Charlie).deposit(parseEther('2000000'));

      await token.transfer(Eve.address, parseEther('200000'));
      await token.connect(Eve).approve(glmDeposits.address, parseEther('200000'));
      await glmDeposits.connect(Eve).deposit(parseEther('200000'));

      // Set ETH proceeds in first epoch
      await forwardEpochs(epochs, 1); // epoch #2
      await beaconChainOracle.setBalance(1, parseEther('200'));
      await executionLayerOracle.setBalance(1, parseEther('200'));

      // Set ETH proceeds in second epoch
      await forwardEpochs(epochs, 1); // epoch #3
      await beaconChainOracle.setBalance(2, parseEther('400'));
      await executionLayerOracle.setBalance(2, parseEther('400'));

      // Users vote in epoch 3 for proceeds of epoch 2
      await allocations.connect(Alice).vote(1, 30);
      await allocations.connect(Bob).vote(2, 50);
      await allocations.connect(Charlie).vote(2, 10);
      await allocations.connect(Eve).vote(4, 40);
    });

    it('Compute individual proposal rewards', async () => {
      const { epochs, rewards } = testEnv;
      const proposalRewards = await rewards.individualProposalRewards(2);
      expect(proposalRewards[0], 'proposal rewards sum').eq(parseEther('0.332'));
      const firstProposal = proposalRewards[1][0];
      expect(firstProposal.id).eq(1);
      expect(firstProposal.donated).eq(parseEther('0.12'));
      expect(firstProposal.matched).eq(0);
      const secondProposal = proposalRewards[1][1];
      expect(secondProposal.id).eq(2);
      expect(secondProposal.donated).eq(parseEther('0.18'));
      expect(secondProposal.matched).eq(0);
      const thirdProposal = proposalRewards[1][2];
      expect(thirdProposal.id).eq(3);
      expect(thirdProposal.donated).eq(0);
      expect(thirdProposal.matched).eq(0);
      const fourthProposal = proposalRewards[1][3];
      expect(fourthProposal.id).eq(4);
      expect(fourthProposal.donated).eq(parseEther('0.032'));
      expect(fourthProposal.matched).eq(0);
      proposalRewards[1].slice(4).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });
    });

    it('Compute matched proposal rewards', async function () {
      const { rewards } = testEnv;
      const matchedRewards = await rewards.matchedRewards(2);
      expect(matchedRewards).eq(parseEther("22.851050121192878400"));
      const proposalRewards = await rewards.matchedProposalRewards(2);
      const firstProposal = proposalRewards[0];
      expect(firstProposal.id).eq(1);
      expect(firstProposal.donated).eq(parseEther('0.12'));
      expect(firstProposal.matched).eq(parseEther('9.140420048477151360'));
      const secondProposal = proposalRewards[1];
      expect(secondProposal.id).eq(2);
      expect(secondProposal.donated).eq(parseEther('0.18'));
      expect(secondProposal.matched).eq(parseEther("13.710630072715727040"));
      const thirdProposal = proposalRewards[2];
      expect(thirdProposal.id).eq(3);
      expect(thirdProposal.donated).eq(0);
      expect(thirdProposal.matched).eq(0);
      const fourthProposal = proposalRewards[3];

      // fourth proposal didn't pass the threshold -> matched = 0
      expect(fourthProposal.id).eq(4);
      expect(fourthProposal.donated).eq(parseEther('0.032'));
      expect(fourthProposal.matched).eq(0);
      proposalRewards.slice(4).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });

      expect(matchedRewards).eq(firstProposal.matched.add(secondProposal.matched));
    });
  });
});
