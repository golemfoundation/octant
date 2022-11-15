import { expect } from 'chai';
import { HEXAGON_ORACLE } from '../../helpers/constants';
import { makeTestsEnv } from '../helpers/make-tests-env';

interface TestParam {
  epoch: number;
  value: number;
}

interface TestParams {
  desc: string;
  executionLayerOracleFeed: TestParam[];
  beaconChainOracleFeed: TestParam[];
  asserts: TestParam[];
}

makeTestsEnv(HEXAGON_ORACLE, (testEnv) => {

  describe('getTotalETHStakingProceeds', async () => {
    const parameters: TestParams[] = [
      {
        desc: 'Should calculate proceeds in first epoch',
        executionLayerOracleFeed: [{ epoch: 1, value: 100 }],
        beaconChainOracleFeed: [{ epoch: 1, value: 300 }],
        asserts: [{ epoch: 1, value: 400 }]
      },
      {
        desc: 'Should calculate proceeds in second epoch',
        executionLayerOracleFeed: [{ epoch: 1, value: 100 }, { epoch: 2, value: 3330 }],
        beaconChainOracleFeed: [{ epoch: 1, value: 300 }, { epoch: 2, value: 321 }],
        asserts: [{ epoch: 2, value: 3251 }]
      },
      {
        desc: 'Should return 0 for epoch from the future',
        executionLayerOracleFeed: [{ epoch: 1, value: 100 }],
        beaconChainOracleFeed: [{ epoch: 1, value: 300 }],
        asserts: [{ epoch: 3, value: 0 }]
      },
      {
        desc: 'Should be able to get proceeds for former epochs',
        executionLayerOracleFeed: [{ epoch: 1, value: 100 }, { epoch: 2, value: 220 }, { epoch: 3, value: 320 }],
        beaconChainOracleFeed: [{ epoch: 1, value: 100 }, { epoch: 2, value: 220 }, { epoch: 3, value: 320 }],
        asserts: [{ epoch: 2, value: 240 }]
      },
    ];

    parameters.forEach(({ desc, beaconChainOracleFeed, executionLayerOracleFeed, asserts }) => {
      it(desc, async () => {
        // given
        const { beaconChainOracle, executionLayerOracle, hexagonOracle } = testEnv;

        // when
        for (const { epoch, value } of executionLayerOracleFeed) {
          await executionLayerOracle.setBalance(epoch, value);
        }
        for (const { epoch, value } of beaconChainOracleFeed) {
          await beaconChainOracle.setBalance(epoch, value);
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
