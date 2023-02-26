import { expect } from 'chai';
import { ethers, deployments } from 'hardhat';

import { OCTANT_ORACLE } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { makeTestsEnv } from '../helpers/make-tests-env';
import { WithdrawalsTargetV3 } from '../../typechain-types';

interface OracleFeed {
  beaconChain: number;
  executionLayer: number;
}

interface Asserts {
  epoch: number;
  value: number;
}

interface TestParams {
  asserts: Asserts[];
  desc: string;
  oracleFeedInEpochs: OracleFeed[];
}

makeTestsEnv(OCTANT_ORACLE, testEnv => {
  describe('getTotalETHStakingProceeds', async () => {
    const parameters: TestParams[] = [
      {
        asserts: [{ epoch: 1, value: 400 }],
        desc: 'Should calculate proceeds in first epoch',
        oracleFeedInEpochs: [{ beaconChain: 300, executionLayer: 100 }],
      },
      {
        asserts: [{ epoch: 2, value: 3651 }],
        desc: 'Should calculate proceeds in second epoch',
        oracleFeedInEpochs: [
          { beaconChain: 300, executionLayer: 100 },
          {
            beaconChain: 321,
            executionLayer: 3330,
          },
        ],
      },
      {
        asserts: [{ epoch: 3, value: 0 }],
        desc: 'Should return 0 for epoch from the future',
        oracleFeedInEpochs: [{ beaconChain: 300, executionLayer: 100 }],
      },
      {
        asserts: [{ epoch: 2, value: 240 }],
        desc: 'Should be able to get proceeds for former epochs',
        oracleFeedInEpochs: [
          { beaconChain: 100, executionLayer: 100 },
          { beaconChain: 120, executionLayer: 120 },
          { beaconChain: 120, executionLayer: 120 },
        ],
      },
    ];

    parameters.forEach(({ desc, oracleFeedInEpochs, asserts }) => {
      it(desc, async () => {
        // given
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

        // when
        for (let i = 0; i < oracleFeedInEpochs.length; i++) {
          const { executionLayer, beaconChain } = oracleFeedInEpochs[i];
          // Following actions need to be done in sequence, hence await in for instead of Promise.all.
          /* eslint-disable no-await-in-loop */
          await target.sendETH({ value: executionLayer + beaconChain });
          await forwardEpochs(epochs, 1);
          await octantOracle.writeBalance();
          /* eslint-enable no-await-in-loop */
        }

        // then
        for (const { epoch, value } of asserts) {
          // Following actions need to be done in sequence, hence await in for instead of Promise.all.
          // eslint-disable-next-line no-await-in-loop
          const proceeds = await octantOracle.getTotalETHStakingProceeds(epoch);
          expect(proceeds).eq(value);
        }
      });
    });
  });
});
