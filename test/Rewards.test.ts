import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';

import { makeTestsEnv } from './helpers/make-tests-env';

import { REWARDS } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';

makeTestsEnv(REWARDS, testEnv => {
  async function updateOracle() {
    const { epochs, beaconChainOracle, executionLayerOracle } = testEnv;
    await forwardEpochs(epochs, 1);
    await beaconChainOracle.setBalance(1, parseEther('200'));
    await executionLayerOracle.setBalance(1, parseEther('200'));
    await forwardEpochs(epochs, 1);
    await beaconChainOracle.setBalance(2, parseEther('400'));
    await executionLayerOracle.setBalance(2, parseEther('400'));
  }

  describe('individual rewards', async () => {
    it('single player scenario', async () => {
      const { glmDeposits, rewards, tracker, signers, token } = testEnv;
      await token.transfer(signers.Alice.address, parseEther('1000000'));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(signers.Alice).deposit(parseEther('1000000'));
      await updateOracle();
      expect(await tracker.totalDepositAt(2), 'total deposit').eq(parseEther('1000000'));
      expect(await rewards.stakedRatio(2), 'staked ratio').eq(parseEther('0.001'));
      expect(await rewards.allIndividualRewards(2), 'sum of IRs').eq(parseEther('0.4'));
      expect(await rewards.individualReward(2, signers.Alice.address), 'Alice IR').eq(
        parseEther('0.4'),
      );
      expect(await rewards.totalRewards(2), 'totalRewards').within(
        parseEther('12'),
        parseEther('13'),
      );
    });

    it('multiplayer scenario', async () => {
      const { glmDeposits, rewards, tracker, signers, token } = testEnv;
      await token.transfer(signers.Alice.address, parseEther('1000000'));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(signers.Alice).deposit(parseEther('1000000'));
      await token.transfer(signers.Bob.address, parseEther('500000'));
      await token.connect(signers.Bob).approve(glmDeposits.address, parseEther('500000'));
      await glmDeposits.connect(signers.Bob).deposit(parseEther('500000'));
      await updateOracle();
      expect(await tracker.totalDepositAt(2), 'total deposit').eq(parseEther('1500000'));
      expect(await rewards.stakedRatio(2), 'staked ratio').eq(parseEther('0.0015'));
      expect(await rewards.allIndividualRewards(2), 'sum of IRs').eq(parseEther('0.6'));
      expect(await rewards.individualReward(2, signers.Alice.address), 'Alice IR').eq(
        parseEther('0.4'),
      );
      expect(await rewards.individualReward(2, signers.Bob.address), 'Bob IR').eq(
        parseEther('0.2'),
      );
      expect(await rewards.totalRewards(2), 'totalRewards').within(
        parseEther('15'),
        parseEther('16'),
      );
    });
  });

  it('Compute total rewards', async () => {
    const { glmDeposits, rewards, signers, token } = testEnv;
    await token.transfer(signers.Alice.address, parseEther('1000000'));
    await token.connect(signers.Alice).approve(glmDeposits.address, parseEther('1000000'));
    await glmDeposits.connect(signers.Alice).deposit(parseEther('1000000'));
    await updateOracle();
    expect(await rewards.totalRewards(2), 'sum of TRs').eq(parseEther('12.6491106406735172'));
  });

  describe('Tests dependent on allocations', async () => {
    beforeEach(async () => {
      const {
        token,
        glmDeposits,
        allocations,
        signers: { Alice, Bob, Charlie, Eve },
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

      await updateOracle();

      // Users allocate in epoch 3 for proceeds of epoch 2
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.12'),
          proposalId: 1,
        },
      ]);
      await allocations.connect(Bob).allocate([
        {
          allocation: parseEther('0.1'),
          proposalId: 2,
        },
      ]);
      await allocations.connect(Charlie).allocate([
        { allocation: parseEther('0.08'), proposalId: 2 },
        { allocation: parseEther('0.00001'), proposalId: 5 },
        { allocation: parseEther('0.000000000009'), proposalId: 4 },
      ]);
      await allocations.connect(Eve).allocate([
        { allocation: parseEther('0.032'), proposalId: 4 },
        { allocation: parseEther('0.0000000989'), proposalId: 1 },
      ]);
    });

    it('Claimable rewards are equal to 0 in the first epoch', async () => {
      const {
        rewards,
        signers: { Alice, Bob, Charlie, Eve },
      } = testEnv;
      const aliceClaimableRewards = await rewards.claimableReward(1, Alice.address);
      const bobClaimableRewards = await rewards.claimableReward(1, Bob.address);
      const charlieClaimableRewards = await rewards.claimableReward(1, Charlie.address);
      const eveClaimableRewards = await rewards.claimableReward(1, Eve.address);

      expect(aliceClaimableRewards).eq(0);
      expect(bobClaimableRewards).eq(0);
      expect(charlieClaimableRewards).eq(0);
      expect(eveClaimableRewards).eq(0);
    });

    it('Compute claimable rewards', async () => {
      const {
        rewards,
        signers: { Alice, Bob, Charlie, Eve },
      } = testEnv;
      const aliceClaimableRewards = await rewards.claimableReward(2, Alice.address);
      const bobClaimableRewards = await rewards.claimableReward(2, Bob.address);
      const charlieClaimableRewards = await rewards.claimableReward(2, Charlie.address);
      const eveClaimableRewards = await rewards.claimableReward(2, Eve.address);

      expect(aliceClaimableRewards).eq(parseEther('0.28'));
      expect(bobClaimableRewards).eq(parseEther('0.1'));
      expect(charlieClaimableRewards).eq(parseEther('0.719989999990999999'));
      expect(eveClaimableRewards).eq(parseEther('0.0479999011'));
    });

    it('Proposal reward is equal to 0 in the first epoch', async () => {
      const { rewards } = testEnv;

      for (let i = 0; i < 10; i++) {
        /* eslint-disable no-await-in-loop */
        const proposalReward = await rewards.proposalReward(1, i);
        expect(proposalReward).eq(0);
      }
    });

    it('Compute proposal reward', async () => {
      const { rewards } = testEnv;
      const firstProposalReward = await rewards.proposalReward(2, 1);
      expect(firstProposalReward).eq(parseEther('9.260424667313375238'));
      const secondProposalReward = await rewards.proposalReward(2, 2);
      expect(secondProposalReward).eq(parseEther('13.890625552779503139'));

      for (let i = 3; i < 10; i++) {
        /* eslint-disable no-await-in-loop */
        const proposalReward = await rewards.proposalReward(1, i);
        expect(proposalReward).eq(0);
      }
    });

    it('Compute individual proposal rewards', async () => {
      const { rewards } = testEnv;

      const proposalRewards = await rewards.individualProposalRewards(2);
      expect(proposalRewards[0], 'proposal rewards sum').eq(parseEther('0.332010098909'));
      const firstProposal = proposalRewards[1][0];
      expect(firstProposal.id).eq(1);
      expect(firstProposal.donated).eq(parseEther('0.1200000989'));
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
      expect(fourthProposal.donated).eq(parseEther('0.032000000009'));
      expect(fourthProposal.matched).eq(0);
      const fifthProposal = proposalRewards[1][4];
      expect(fifthProposal.id).eq(5);
      expect(fifthProposal.donated).eq(parseEther('0.00001'));
      expect(fifthProposal.matched).eq(0);
      proposalRewards[1].slice(5).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });
    });

    it('Compute matched proposal rewards', async () => {
      const { rewards } = testEnv;
      const matchedRewards = await rewards.matchedRewards(2);
      expect(matchedRewards).eq(parseEther('22.851050121192878400'));
      const proposalRewards = await rewards.matchedProposalRewards(2);
      const firstProposal = proposalRewards[0];
      expect(firstProposal.id).eq(1);
      expect(firstProposal.donated).eq(parseEther('0.1200000989'));
      expect(firstProposal.matched).eq(parseEther('9.140424568413375238'));
      const secondProposal = proposalRewards[1];
      expect(secondProposal.id).eq(2);
      expect(secondProposal.donated).eq(parseEther('0.18'));
      expect(secondProposal.matched).eq(parseEther('13.710625552779503139'));
      const thirdProposal = proposalRewards[2];
      expect(thirdProposal.id).eq(3);
      expect(thirdProposal.donated).eq(0);
      expect(thirdProposal.matched).eq(0);
      const fourthProposal = proposalRewards[3];
      // fourth and fifth proposal didn't pass the threshold -> matched = 0
      expect(fourthProposal.id).eq(4);
      expect(fourthProposal.donated).eq(parseEther('0.032000000009'));
      expect(fourthProposal.matched).eq(0);
      const fifthProposal = proposalRewards[4];
      expect(fifthProposal.id).eq(5);
      expect(fifthProposal.donated).eq(parseEther('0.00001'));
      expect(fifthProposal.matched).eq(0);

      proposalRewards.slice(5).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });
      expect(matchedRewards).approximately(firstProposal.matched.add(secondProposal.matched), 30);
    });
  });
});
