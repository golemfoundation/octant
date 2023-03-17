import { expect } from 'chai';
import { ethers } from 'hardhat';

import { isChangePropsStep, testScenarios } from './epochsTestParameters';

import { EPOCHS } from '../../helpers/constants';
import {
  getLatestBlockTimestamp,
  increaseNextBlockTimestamp,
  setNextBlockTimestamp,
} from '../../helpers/misc-utils';
import { Epochs } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(EPOCHS, testEnv => {
  const epochDuration = 5000;
  const decisionWindow = 2000;

  async function setupEpochs(start: number) {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    return (await epochsFactory.deploy(start, epochDuration, decisionWindow)) as Epochs;
  }

  describe('Epoch numbering', () => {
    it('Starts from 1', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      expect(await epochs.getCurrentEpoch()).eq(1);
    });
  });

  describe('Epoch duration, without changes in epoch properties', () => {
    const parameters = [
      { increaseNextBlockTsBy: 0, result: 1 },
      { increaseNextBlockTsBy: 100, result: 1 },
      { increaseNextBlockTsBy: 2000, result: 1 },
      { increaseNextBlockTsBy: 4990, result: 1 },
      { increaseNextBlockTsBy: 5010, result: 2 },
      { increaseNextBlockTsBy: 7010, result: 2 },
      { increaseNextBlockTsBy: 9990, result: 2 },
      { increaseNextBlockTsBy: 10020, result: 3 },
    ];

    parameters.forEach(param => {
      it(`Epoch num is: ${param.result} when next block timestamp increased by: ${param.increaseNextBlockTsBy}`, async () => {
        const start = await getLatestBlockTimestamp();
        const epochs = await setupEpochs(start);

        await increaseNextBlockTimestamp(param.increaseNextBlockTsBy);
        const currentEpoch = await epochs.getCurrentEpoch();

        expect(currentEpoch).eq(param.result);
      });
    });
  });

  describe('Epoch duration, with changes in epoch properties', () => {
    testScenarios.forEach(scenario => {
      it(`${scenario.desc}`, async () => {
        const start = await getLatestBlockTimestamp();
        const epochs = await setupEpochs(start);

        for (const step of scenario.steps) {
          if (isChangePropsStep(step)) {
            /* eslint-disable no-await-in-loop */
            await epochs.setEpochProps(
              step.changeNextEpochProps.epochDuration,
              step.changeNextEpochProps.decisionWindow,
            );
          } else {
            /* eslint-disable no-await-in-loop */
            await setNextBlockTimestamp(start + step.timestamp);
            /* eslint-disable no-await-in-loop */
            const epoch = await epochs.getCurrentEpoch();
            expect(epoch).eq(step.expectedEpoch);
            /* eslint-disable no-await-in-loop */
            const isDecisionWindowOpen = await epochs.isDecisionWindowOpen();
            expect(isDecisionWindowOpen).eq(step.expectedDecisionWindowOpen);
            /* eslint-disable no-await-in-loop */
            const epochEnd = await epochs.getCurrentEpochEnd();
            expect(epochEnd).approximately(start + step.expectedCurrentEpochEnd, 100);
          }
        }
      });
    });
  });

  describe('Decision window, without changes in epoch properties', () => {
    const parameters = [
      { increaseNextBlockTsBy: 0, result: false },
      { increaseNextBlockTsBy: 100, result: false },
      { increaseNextBlockTsBy: 1990, result: false },
      { increaseNextBlockTsBy: 3010, result: false },
      { increaseNextBlockTsBy: 5010, result: true },
      { increaseNextBlockTsBy: 5190, result: true },
      { increaseNextBlockTsBy: 7010, result: false },
      { increaseNextBlockTsBy: 9990, result: false },
      { increaseNextBlockTsBy: 10020, result: true },
      { increaseNextBlockTsBy: 11900, result: true },
      { increaseNextBlockTsBy: 12100, result: false },
    ];

    parameters.forEach(param => {
      it(`isDecisionWindowOpen: ${param.result} when next block timestamp increased by: ${param.increaseNextBlockTsBy}`, async () => {
        const start = await getLatestBlockTimestamp();
        const epochs = await setupEpochs(start);

        await increaseNextBlockTimestamp(param.increaseNextBlockTsBy);
        const isOpen = await epochs.isDecisionWindowOpen();

        expect(isOpen).eq(param.result);
      });
    });
  });

  describe('Is started', () => {
    it(`should be started`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await increaseNextBlockTimestamp(10);
      const isOpen = await epochs.isStarted();

      expect(isOpen).true;
    });

    it(`should not be started`, async () => {
      const latestBlockTimestamp = await getLatestBlockTimestamp();
      const start = latestBlockTimestamp + 100;
      const epochs = await setupEpochs(start);

      const isOpen = await epochs.isStarted();

      expect(isOpen).false;
    });
  });

  describe('Current epoch duration', () => {
    it(`Returns correct value for initial props`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      const duration = await epochs.getEpochDuration();

      expect(duration).eq(5000);
    });

    it(`Returns correct value for changed props`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await epochs.setEpochProps(1000, 1000);

      await increaseNextBlockTimestamp(5010);

      const duration = await epochs.getEpochDuration();

      expect(duration).eq(1000);
    });

    it(`Changing props does not change duration of old epochs`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await increaseNextBlockTimestamp(10);
      expect(await epochs.getCurrentEpoch()).eq(1);
      const currentEpochDuration = await epochs.getEpochDuration();
      await epochs.setEpochProps(1000, 1000);
      expect(await epochs.getEpochDuration()).eq(currentEpochDuration);
    });
  });

  describe('Current epoch decision window duration', () => {
    it(`Returns correct value for initial props`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      const duration = await epochs.getDecisionWindow();

      expect(duration).eq(2000);
    });

    it(`Returns correct value for changed props`, async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await epochs.setEpochProps(7000, 3000);

      await increaseNextBlockTimestamp(5010);

      const duration = await epochs.getDecisionWindow();

      expect(duration).eq(3000);
    });
  });

  it('Cannot change decision window if not an owner', async () => {
    const {
      epochs,
      signers: { Darth },
    } = testEnv;
    expect(epochs.connect(Darth).setEpochProps(0, 0)).revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Cannot change props when decision window is bigger than epoch duration', async () => {
    const { epochs } = testEnv;
    expect(epochs.setEpochProps(1000, 2000)).revertedWith(
      'HN:Epochs/decision-window-bigger-than-duration',
    );
  });
});
