import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import { TestScenario, testScenarios } from './rewardsTestParameters';

import {
  ALLOCATIONS_STORAGE,
  OCTANT_ORACLE,
  PROPOSALS,
  REWARDS,
  TRACKER,
} from '../../helpers/constants';
import { AllocationsStorage, OctantOracle, Proposals, Rewards, Tracker } from '../../typechain';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(REWARDS, testEnv => {
  async function donationsAboveThreshold(
    params: TestScenario,
    proposalAddresses: SignerWithAddress[],
  ) {
    const allocations = [
      params.aliceAllocation,
      params.bobAllocation,
      params.charlieAllocation,
    ].map(ir => Number(ir));
    const allocationsSum = allocations.reduce((sum, current) => sum + current, 0);
    const threshold = allocationsSum / (proposalAddresses.length * 2);

    return allocations.filter(ir => ir >= threshold).reduce((sum, current) => sum + current, 0);
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
        const { proposalAddresses } = testEnv;
        const testProposalAddresses = proposalAddresses
          .slice(0, param.proposalsNumber)
          .map(proposal => proposal.address);

        proposals.getProposalAddresses.returns((_epoch: number) => testProposalAddresses);

        await allocationsStorage.getProposalAllocation.returns((_args: string[]) => {
          for (let i = 0; i < testProposalAddresses.length; i++) {
            // args[1] is proposalAddress
            if (_args[1] === testProposalAddresses[i]) {
              const allocation = ((i + 1) * i) / 100;
              return parseEther(allocation.toString());
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

  describe('Proposal rewards', async () => {
    let oracle: FakeContract<OctantOracle>;
    let tracker: FakeContract<Tracker>;
    let allocationsStorage: FakeContract<AllocationsStorage>;
    let rewards: Rewards;

    beforeEach(async () => {
      const { proposals } = testEnv;
      oracle = await smock.fake<OctantOracle>(OCTANT_ORACLE);
      tracker = await smock.fake<Tracker>(TRACKER);
      allocationsStorage = await smock.fake<AllocationsStorage>(ALLOCATIONS_STORAGE);
      oracle.getTotalETHStakingProceeds.returns((_epoch: number) => parseEther('402.41'));
      tracker.tokenSupplyAt.returns((_epoch: number) => parseEther('1000000000'));
      const rewardsFactory = await ethers.getContractFactory(REWARDS);
      rewards = (await rewardsFactory.deploy(
        tracker.address,
        oracle.address,
        proposals.address,
        allocationsStorage.address,
      )) as Rewards;
    });

    testScenarios.forEach(params => {
      it(`Proposal rewards :${JSON.stringify(params)}`, async () => {
        const { proposalAddresses } = testEnv;
        tracker.totalDepositAt.returns((_epoch: number) => parseEther(params.totalDeposit));
        await allocationsStorage.getProposalAllocation.returns((_args: string[]) => {
          if (_args[1] === proposalAddresses[0].address) {
            return parseEther(params.aliceAllocation);
          }
          if (_args[1] === proposalAddresses[1].address) {
            return parseEther(params.bobAllocation);
          }
          if (_args[1] === proposalAddresses[2].address) {
            return parseEther(params.charlieAllocation);
          }
          return 0;
        });
        const proposal1Rewards = await rewards.proposalReward(2, proposalAddresses[0].address);
        const proposal2Rewards = await rewards.proposalReward(2, proposalAddresses[1].address);
        const proposal3Rewards = await rewards.proposalReward(2, proposalAddresses[2].address);
        expect(proposal1Rewards).approximately(
          parseEther(params.proposal1rewards),
          parseEther('0.00001'),
        );
        expect(proposal2Rewards).approximately(
          parseEther(params.proposal2rewards),
          parseEther('0.00001'),
        );
        expect(proposal3Rewards).approximately(
          parseEther(params.proposal3rewards),
          parseEther('0.00001'),
        );

        const donations = await donationsAboveThreshold(params, proposalAddresses);
        expect(proposal1Rewards.add(proposal2Rewards).add(proposal3Rewards)).approximately(
          parseEther(donations.toString()).add(parseEther(params.matchedRewards)),
          parseEther('0.00001'),
        );
      });
    });
  });
});
