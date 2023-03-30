import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { testScenarios } from './rewardsTestParameters';

import { OCTANT_ORACLE, REWARDS, TRACKER } from '../../helpers/constants';
import { OctantOracle, Rewards, Tracker } from '../../typechain';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(REWARDS, testEnv => {
  describe('Total, matched and individual rewards', async () => {
    let oracle: FakeContract<OctantOracle>;
    let tracker: FakeContract<Tracker>;
    let rewards: Rewards;

    beforeEach(async () => {
      const { proposals, allocationsStorage } = testEnv;
      oracle = await smock.fake<OctantOracle>(OCTANT_ORACLE);
      tracker = await smock.fake<Tracker>(TRACKER);
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
      it(`Total, matched, all individual rewards :${JSON.stringify(params)}`, async () => {
        tracker.totalDepositAt.returns((_epoch: number) => parseEther(params.totalDeposit));
        const matchedRewards = await rewards.matchedRewards(2);
        const individualRewards = await rewards.allIndividualRewards(2);
        expect(await rewards.totalRewards(2)).approximately(
          parseEther(params.totalRewards),
          parseEther('0.00001'),
        );
        expect(matchedRewards).approximately(
          parseEther(params.matchedRewards),
          parseEther('0.00001'),
        );
        expect(individualRewards).approximately(
          parseEther(params.individualRewards),
          parseEther('0.00001'),
        );
        expect(matchedRewards.add(individualRewards)).approximately(
          parseEther(params.totalRewards),
          parseEther('0.00001'),
        );
      });

      it(`User individual rewards :${JSON.stringify(params)}`, async () => {
        const {
          signers: { Alice, Bob, Charlie },
        } = testEnv;
        tracker.totalDepositAt.returns((_epoch: number) => parseEther(params.totalDeposit));
        tracker.depositAt.returns((args: unknown[]) => {
          if (args[0] === Alice.address) {
            return parseEther(params.aliceDeposit);
          }
          if (args[0] === Bob.address) {
            return parseEther(params.bobDeposit);
          }
          return parseEther(params.charlieDeposit);
        });
        const aliceRewards = await rewards.individualReward(2, Alice.address);
        const bobRewards = await rewards.individualReward(2, Bob.address);
        const charlieRewards = await rewards.individualReward(2, Charlie.address);
        expect(aliceRewards).approximately(parseEther(params.aliceIR), parseEther('0.00001'));
        expect(bobRewards).approximately(parseEther(params.bobIR), parseEther('0.00001'));
        expect(charlieRewards).approximately(parseEther(params.charlieIR), parseEther('0.00001'));
        expect(aliceRewards.add(bobRewards).add(charlieRewards)).approximately(
          parseEther(params.individualRewards),
          parseEther('0.00001'),
        );
      });
    });
  });
});
