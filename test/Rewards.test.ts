import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers, deployments } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import {
  ALLOCATIONS_STORAGE,
  OCTANT_ORACLE,
  PROPOSALS,
  REWARDS,
  TRACKER,
} from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import {
  WithdrawalsTargetV3,
  Proposals,
  Rewards,
  Tracker,
  OctantOracle,
  AllocationsStorage,
} from '../typechain-types';

makeTestsEnv(REWARDS, testEnv => {
  async function updateOracle() {
    const { epochs, octantOracle, signers } = testEnv;
    const { deploy } = deployments;
    const t = await deploy('WithdrawalsTarget', {
      contract: 'WithdrawalsTargetV3',
      from: signers.deployer.address,
      proxy: true,
    });
    const target: WithdrawalsTargetV3 = await ethers.getContractAt(
      'WithdrawalsTargetV3',
      t.address,
    );
    expect(await target.version()).eq(3);
    await forwardEpochs(epochs, 1);
    await target.sendETH({ value: ethers.utils.parseEther('400.0') });
    await forwardEpochs(epochs, 1);
    await octantOracle.writeBalance();
    await target.sendETH({ value: ethers.utils.parseEther('400.0') });
  }

  describe('Proposal donation threshold', async () => {
    let proposals: FakeContract<Proposals>;
    let allocationsStorage: FakeContract<AllocationsStorage>;
    let rewards: Rewards;

    beforeEach(async () => {
      proposals = await smock.fake<Proposals>(PROPOSALS);
      const oracle = await smock.fake<OctantOracle>(OCTANT_ORACLE);
      oracle.getTotalETHStakingProceeds.returns((_epoch: number) => parseEther('400'));
      const tracker = await smock.fake<Tracker>(TRACKER);
      tracker.tokenSupplyAt.returns((_epoch: number) => parseEther('1000000000'));
      tracker.totalDepositAt.returns((_epoch: number) => parseEther('10000'));
      allocationsStorage = await smock.fake<AllocationsStorage>(ALLOCATIONS_STORAGE);
      const rewardsFactory = await ethers.getContractFactory(REWARDS);
      rewards = (await rewardsFactory.deploy(
        tracker.address,
        oracle.address,
        proposals.address,
        allocationsStorage.address,
      )) as Rewards;
    });

    const parameters = [
      // threshold 25% (0.0125), donations [0.01, 0.04]
      { fraction: '0.25', proposalsNotPassingThresholdNum: 1, proposalsNumber: 2 },
      // threshold 16.6666% (0.0224), donations [0.01, 0.04, 0.09]
      { fraction: '0.166666666666666666', proposalsNotPassingThresholdNum: 1, proposalsNumber: 3 },
      // threshold 10% (0.055), donations [0.01, 0.04, 0.09, 0.16, 0.25]
      { fraction: '0.1', proposalsNotPassingThresholdNum: 2, proposalsNumber: 5 },
      // threshold 5% (0.1925), donations [0.01, 0.04, 0.09, 0.16, 0.25, 0.36, 0.49, 0.64, 0.81, 1]
      { fraction: '0.05', proposalsNotPassingThresholdNum: 4, proposalsNumber: 10 },
      // threshold 4.16666%, (0,27083333329), donations [0.01, 0.04, 0.09, 0.16, 0.25, 0.36, 0.49, 0.64, 0.81, 1, 1,21, 1,44]
      { fraction: '0.041666666666666666', proposalsNotPassingThresholdNum: 5, proposalsNumber: 12 },
    ];

    parameters.forEach(param => {
      it(`${param.proposalsNotPassingThresholdNum} proposals eligible for matched funds when there are ${param.proposalsNumber} proposals`, async () => {
        const {
          proposalAddresses,
          signers: { Alice },
        } = testEnv;
        const testProposalAddresses = proposalAddresses
          .slice(0, param.proposalsNumber)
          .map(proposal => proposal.address);

        proposals.getProposalAddresses.returns((_epoch: number) => testProposalAddresses);

        await allocationsStorage.getUsersWithTheirAllocations.returns((_args: string[]) => {
          for (let i = 0; i < testProposalAddresses.length; i++) {
            // args[1] is proposalAddress
            if (_args[1] === testProposalAddresses[i]) {
              const allocation = ((i + 1) * i) / 100;
              return [[Alice.address], [parseEther(allocation.toString())]];
            }
          }
        });

        const proposalRewards = await rewards.matchedProposalRewards(2);
        for (let i = 0; i < param.proposalsNotPassingThresholdNum; i++) {
          expect(proposalRewards[i].matched).eq(0);
        }

        for (let i = param.proposalsNotPassingThresholdNum; i < proposalRewards.length; i++) {
          expect(proposalRewards[i].matched).gt(0);
        }
      });

      it(`Fraction is ${param.fraction} when there are ${param.proposalsNumber} proposals`, async () => {
        const { proposalAddresses } = testEnv;
        const testProposalAddresses = proposalAddresses
          .slice(0, param.proposalsNumber)
          .map(proposal => proposal.address);

        proposals.getProposalAddresses.returns((_epoch: number) => testProposalAddresses);

        const proposalRewardsThresholdFraction = await rewards.proposalRewardsThresholdFraction(2);
        expect(formatEther(proposalRewardsThresholdFraction)).eq(param.fraction);
      });
    });
  });

  describe('individual rewards', async () => {
    it('single player scenario', async () => {
      const { glmDeposits, rewards, tracker, signers, token } = testEnv;
      await token.transfer(signers.Alice.address, parseEther('1000000'));
      await token.connect(signers.Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(signers.Alice).lock(parseEther('1000000'));
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
      await glmDeposits.connect(signers.Alice).lock(parseEther('1000000'));
      await token.transfer(signers.Bob.address, parseEther('500000'));
      await token.connect(signers.Bob).approve(glmDeposits.address, parseEther('500000'));
      await glmDeposits.connect(signers.Bob).lock(parseEther('500000'));
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
    await glmDeposits.connect(signers.Alice).lock(parseEther('1000000'));
    await updateOracle();
    expect(await rewards.totalRewards(2), 'sum of TRs').eq(parseEther('12.6491106406735172'));
  });

  describe('Tests dependent on allocations', async () => {
    beforeEach(async () => {
      const {
        token,
        glmDeposits,
        allocations,
        signers: { Alice, Bob, Charlie, Eve, Darth },
        proposalAddresses,
      } = testEnv;

      // Users deposit
      await token.transfer(Alice.address, parseEther('1000000'));
      await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(Alice).lock(parseEther('1000000'));

      await token.transfer(Bob.address, parseEther('500000'));
      await token.connect(Bob).approve(glmDeposits.address, parseEther('500000'));
      await glmDeposits.connect(Bob).lock(parseEther('500000'));

      await token.transfer(Charlie.address, parseEther('2000000'));
      await token.connect(Charlie).approve(glmDeposits.address, parseEther('2000000'));
      await glmDeposits.connect(Charlie).lock(parseEther('2000000'));

      // Darth does not vote, his rewards go back to Golem Foundation
      await token.transfer(Darth.address, parseEther('1500'));
      await token.connect(Darth).approve(glmDeposits.address, parseEther('1500'));
      await glmDeposits.connect(Darth).lock(parseEther('1500'));

      await token.transfer(Eve.address, parseEther('200000'));
      await token.connect(Eve).approve(glmDeposits.address, parseEther('200000'));
      await glmDeposits.connect(Eve).lock(parseEther('200000'));

      await updateOracle();

      // Users allocate in epoch 3 for proceeds of epoch 2
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.12'),
          proposal: proposalAddresses[0].address,
        },
      ]);
      await allocations.connect(Bob).allocate([
        {
          allocation: parseEther('0.1'),
          proposal: proposalAddresses[1].address,
        },
      ]);
      await allocations.connect(Charlie).allocate([
        { allocation: parseEther('0.08'), proposal: proposalAddresses[1].address },
        { allocation: parseEther('0.00001'), proposal: proposalAddresses[4].address },
        { allocation: parseEther('0.000000000009'), proposal: proposalAddresses[3].address },
      ]);
      await allocations.connect(Eve).allocate([
        { allocation: parseEther('0.032'), proposal: proposalAddresses[3].address },
        { allocation: parseEther('0.0000000989'), proposal: proposalAddresses[0].address },
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

      expect(aliceClaimableRewards).eq(parseEther('0.279999999999999999'));
      expect(bobClaimableRewards).eq(parseEther('0.1'));
      expect(charlieClaimableRewards).eq(parseEther('0.719989999990999999'));
      expect(eveClaimableRewards).eq(parseEther('0.0479999011'));
    });

    it('Proposal reward is equal to 0 in the first epoch', async () => {
      const { rewards, proposalAddresses } = testEnv;

      for (let i = 0; i < 10; i++) {
        /* eslint-disable no-await-in-loop */
        const proposalReward = await rewards.proposalReward(1, proposalAddresses[i].address);
        expect(proposalReward).eq(0);
      }
    });

    it('Compute proposal reward', async () => {
      const { rewards, proposalAddresses } = testEnv;
      const firstProposalReward = await rewards.proposalReward(2, proposalAddresses[0].address);
      expect(firstProposalReward).eq(parseEther('8.380985744193964783'));
      const secondProposalReward = await rewards.proposalReward(2, proposalAddresses[1].address);
      expect(secondProposalReward).eq(parseEther('12.571468255305860080'));

      for (let i = 3; i < 10; i++) {
        /* eslint-disable no-await-in-loop */
        const proposalReward = await rewards.proposalReward(1, proposalAddresses[i].address);
        expect(proposalReward).eq(0);
      }
    });

    it('Compute individual proposal rewards', async () => {
      const { rewards, proposalAddresses } = testEnv;

      const proposalRewards = await rewards.individualProposalRewards(2);
      expect(proposalRewards[0], 'proposal rewards sum').eq(parseEther('0.332010098909'));
      const firstProposal = proposalRewards[1][0];
      expect(firstProposal.proposalAddress).eq(proposalAddresses[0].address);
      expect(firstProposal.donated).eq(parseEther('0.1200000989'));
      expect(firstProposal.matched).eq(0);
      const secondProposal = proposalRewards[1][1];
      expect(secondProposal.proposalAddress).eq(proposalAddresses[1].address);
      expect(secondProposal.donated).eq(parseEther('0.18'));
      expect(secondProposal.matched).eq(0);
      const thirdProposal = proposalRewards[1][2];
      expect(thirdProposal.proposalAddress).eq(proposalAddresses[2].address);
      expect(thirdProposal.donated).eq(0);
      expect(thirdProposal.matched).eq(0);
      const fourthProposal = proposalRewards[1][3];
      expect(fourthProposal.proposalAddress).eq(proposalAddresses[3].address);
      expect(fourthProposal.donated).eq(parseEther('0.032000000009'));
      expect(fourthProposal.matched).eq(0);
      const fifthProposal = proposalRewards[1][4];
      expect(fifthProposal.proposalAddress).eq(proposalAddresses[4].address);
      expect(fifthProposal.donated).eq(parseEther('0.00001'));
      expect(fifthProposal.matched).eq(0);
      proposalRewards[1].slice(5).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });
    });

    it('Compute matched proposal rewards', async () => {
      const {
        rewards,
        signers: { Darth },
        proposalAddresses,
      } = testEnv;
      const matchedRewards = await rewards.matchedRewards(2);
      expect(matchedRewards).eq(parseEther('22.855381591051551200'));
      const proposalRewards = await rewards.matchedProposalRewards(2);
      const firstProposal = proposalRewards[0];
      expect(firstProposal.proposalAddress).eq(proposalAddresses[0].address);
      expect(firstProposal.donated).eq(parseEther('0.1200000989'));
      expect(firstProposal.matched).eq(parseEther('8.260985645293964783'));
      const secondProposal = proposalRewards[1];
      expect(secondProposal.proposalAddress).eq(proposalAddresses[1].address);
      expect(secondProposal.donated).eq(parseEther('0.18'));
      expect(secondProposal.matched).eq(parseEther('12.391468255305860080'));
      const thirdProposal = proposalRewards[2];
      expect(thirdProposal.proposalAddress).eq(proposalAddresses[2].address);
      expect(thirdProposal.donated).eq(0);
      expect(thirdProposal.matched).eq(0);
      const fourthProposal = proposalRewards[3];
      expect(fourthProposal.proposalAddress).eq(proposalAddresses[3].address);
      expect(fourthProposal.donated).eq(parseEther('0.032000000009'));
      expect(fourthProposal.matched).eq(parseEther('2.202927690451726315'));
      // fifth proposal didn't pass the threshold -> matched = 0
      const fifthProposal = proposalRewards[4];
      expect(fifthProposal.proposalAddress).eq(proposalAddresses[4].address);
      expect(fifthProposal.donated).eq(parseEther('0.00001'));
      expect(fifthProposal.matched).eq(0);

      proposalRewards.slice(5).forEach(reward => {
        expect(reward.donated).eq(0);
        expect(reward.matched).eq(0);
      });
      // matched rewards
      expect(matchedRewards).approximately(
        firstProposal.matched.add(secondProposal.matched).add(fourthProposal.matched),
        30,
      );

      // Golem foundation rewards
      const gfRewards = await rewards.golemFoundationReward(2);
      // Darth didn't allocate, his rewards go back to GF
      const darthIndividualReward = await rewards.individualReward(2, Darth.address);
      expect(gfRewards).approximately(fifthProposal.donated.add(darthIndividualReward), 3);
    });
  });
});
