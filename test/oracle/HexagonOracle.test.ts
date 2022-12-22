import { expect } from 'chai';
import { HEXAGON_ORACLE } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { makeTestsEnv } from '../helpers/make-tests-env';

interface OracleFeed {
  executionLayer: number;
  beaconChain: number;
}

interface Asserts {
  epoch: number;
  value: number;
}

interface TestParams {
  desc: string;
  oracleFeedInEpochs: OracleFeed[];
  asserts: Asserts[];
}

makeTestsEnv(HEXAGON_ORACLE, (testEnv) => {

  describe('getTotalETHStakingProceeds', async () => {
    const parameters: TestParams[] = [
      {
        desc: 'Should calculate proceeds in first epoch',
        oracleFeedInEpochs: [{ executionLayer: 100, beaconChain: 300 }],
        asserts: [{ epoch: 1, value: 400 }]
      },
      {
        desc: 'Should calculate proceeds in second epoch',
        oracleFeedInEpochs: [{ executionLayer: 100, beaconChain: 300 }, {
          executionLayer: 3330,
          beaconChain: 321
        }],
        asserts: [{ epoch: 2, value: 3251 }]
      },
      {
        desc: 'Should return 0 for epoch from the future',
        oracleFeedInEpochs: [{ executionLayer: 100, beaconChain: 300 }],
        asserts: [{ epoch: 3, value: 0 }]
      },
      {
        desc: 'Should be able to get proceeds for former epochs',
        oracleFeedInEpochs: [{ executionLayer: 100, beaconChain: 100 },
          { executionLayer: 220, beaconChain: 220 }, { executionLayer: 320, beaconChain: 320 }],
        asserts: [{ epoch: 2, value: 240 }]
      },
    ];

    parameters.forEach(({ desc, oracleFeedInEpochs, asserts }) => {
      it(desc, async () => {
        // given
        const { epochs, beaconChainOracle, executionLayerOracle, hexagonOracle } = testEnv;

        // when
        for (let i = 0; i < oracleFeedInEpochs.length; i++){
          const { executionLayer, beaconChain } = oracleFeedInEpochs[i];
          await forwardEpochs(epochs, 1);
          await executionLayerOracle.setBalance(i + 1, executionLayer);
          await beaconChainOracle.setBalance(i + 1, beaconChain);
        }

        // then
        for (const { epoch, value } of asserts) {
          let proceeds = await hexagonOracle.getTotalETHStakingProceeds(epoch);
          expect(proceeds).eq(value);
        }
      });
    });
  });
});
