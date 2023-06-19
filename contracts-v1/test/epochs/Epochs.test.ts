import { expect } from 'chai';
import { ethers } from 'hardhat';

import { isChangePropsStep, testScenarios } from './epochsTestParameters';

import { AUTH, EPOCHS } from '../../helpers/constants';
import {
  getLatestBlockTimestamp,
  increaseNextBlockTimestamp,
  setNextBlockTimestamp,
} from '../../helpers/misc-utils';
import { Epochs } from '../../typechain';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(EPOCHS, testEnv => {
  const epochDuration = 5000;
  const decisionWindow = 2000;

  async function setupEpochs(start: number) {
    const auth = await ethers.getContract(AUTH);
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    return (await epochsFactory.deploy(
      start,
      epochDuration,
      decisionWindow,
      auth.address,
    )) as Epochs;
  }

  describe('Epoch numbering', () => {
    it('Starts from 1', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      expect(await epochs.getCurrentEpoch()).eq(1);
    });

    it('Starts from 2', async () => {
      const {
        signers: { TestFoundation },
      } = testEnv;

      const latestBlockTs = await getLatestBlockTimestamp();
      const start = latestBlockTs - epochDuration;
      const epochs = await setupEpochs(start);

      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.isDecisionWindowOpen()).true;
      await epochs.connect(TestFoundation).setEpochProps(10000, 3000);

      await setNextBlockTimestamp(latestBlockTs + 2100);
      expect(await epochs.isDecisionWindowOpen()).false;

      await setNextBlockTimestamp(latestBlockTs + 5100);
      expect(await epochs.getCurrentEpoch()).eq(3);

      await setNextBlockTimestamp(latestBlockTs + 7900);
      expect(await epochs.isDecisionWindowOpen()).true;

      await setNextBlockTimestamp(latestBlockTs + 8100);
      expect(await epochs.isDecisionWindowOpen()).false;

      await setNextBlockTimestamp(latestBlockTs + 14900);
      expect(await epochs.getCurrentEpoch()).eq(3);

      await setNextBlockTimestamp(latestBlockTs + 15100);
      expect(await epochs.getCurrentEpoch()).eq(4);
    });
  });

  describe('getFinalizedEpoch', () => {
    it('Reverts when there are no finalized epochs yet', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await expect(epochs.getFinalizedEpoch()).revertedWith('HN:Epochs/not-finalized');

      await setNextBlockTimestamp(start + 4900);
      await expect(epochs.getFinalizedEpoch()).revertedWith('HN:Epochs/not-finalized');

      await setNextBlockTimestamp(start + 6900);
      await expect(epochs.getFinalizedEpoch()).revertedWith('HN:Epochs/not-finalized');
    });

    it('Returns proper finalized epoch num when decision window is closed', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await setNextBlockTimestamp(start + 7100);
      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.getFinalizedEpoch()).eq(1);

      await setNextBlockTimestamp(start + 12100);
      expect(await epochs.getCurrentEpoch()).eq(3);
      expect(await epochs.getFinalizedEpoch()).eq(2);

      await setNextBlockTimestamp(start + 17100);
      expect(await epochs.getCurrentEpoch()).eq(4);
      expect(await epochs.getFinalizedEpoch()).eq(3);
    });

    it('Returns proper finalized epoch num when decision window is open', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await setNextBlockTimestamp(start + 11900);
      expect(await epochs.getCurrentEpoch()).eq(3);
      expect(await epochs.getFinalizedEpoch()).eq(1);

      await setNextBlockTimestamp(start + 16900);
      expect(await epochs.getCurrentEpoch()).eq(4);
      expect(await epochs.getFinalizedEpoch()).eq(2);

      await setNextBlockTimestamp(start + 21900);
      expect(await epochs.getCurrentEpoch()).eq(5);
      expect(await epochs.getFinalizedEpoch()).eq(3);
    });
  });

  describe('getPendingEpoch', () => {
    it('Reverts when decision window is closed', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await expect(epochs.getPendingEpoch()).revertedWith('HN:Epochs/not-pending');

      await setNextBlockTimestamp(start + 4900);
      await expect(epochs.getPendingEpoch()).revertedWith('HN:Epochs/not-pending');

      await setNextBlockTimestamp(start + 7100);
      await expect(epochs.getPendingEpoch()).revertedWith('HN:Epochs/not-pending');

      await setNextBlockTimestamp(start + 12100);
      await expect(epochs.getPendingEpoch()).revertedWith('HN:Epochs/not-pending');
    });

    it('Returns proper pending epoch num when decision window is open', async () => {
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);

      await setNextBlockTimestamp(start + 6900);
      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.getPendingEpoch()).eq(1);

      await setNextBlockTimestamp(start + 11900);
      expect(await epochs.getCurrentEpoch()).eq(3);
      expect(await epochs.getPendingEpoch()).eq(2);

      await setNextBlockTimestamp(start + 16900);
      expect(await epochs.getCurrentEpoch()).eq(4);
      expect(await epochs.getPendingEpoch()).eq(3);
    });
  });

  describe('Epoch duration, without changes in epoch properties', () => {
    const parameters = [
      { increaseNextBlockTsBy: 0, result: 1 },
      { increaseNextBlockTsBy: 100, result: 1 },
      { increaseNextBlockTsBy: 2000, result: 1 },
      { increaseNextBlockTsBy: 4900, result: 1 },
      { increaseNextBlockTsBy: 5100, result: 2 },
      { increaseNextBlockTsBy: 7100, result: 2 },
      { increaseNextBlockTsBy: 9900, result: 2 },
      { increaseNextBlockTsBy: 10100, result: 3 },
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
        const {
          signers: { TestFoundation },
        } = testEnv;
        const start = await getLatestBlockTimestamp();
        const epochs = await setupEpochs(start);

        for (const step of scenario.steps) {
          if (isChangePropsStep(step)) {
            /* eslint-disable no-await-in-loop */
            await epochs
              .connect(TestFoundation)
              .setEpochProps(
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
      { increaseNextBlockTsBy: 1900, result: false },
      { increaseNextBlockTsBy: 3100, result: false },
      { increaseNextBlockTsBy: 5100, result: true },
      { increaseNextBlockTsBy: 7100, result: false },
      { increaseNextBlockTsBy: 9900, result: false },
      { increaseNextBlockTsBy: 10100, result: true },
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

    it('getCurrentEpoch reverts if not started', async () => {
      const start = (await getLatestBlockTimestamp()) + 100;
      const epochs = await setupEpochs(start);

      await expect(epochs.getCurrentEpoch()).revertedWith('HN:Epochs/not-started-yet');
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
      const {
        signers: { TestFoundation },
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await epochs.connect(TestFoundation).setEpochProps(1000, 1000);

      await increaseNextBlockTimestamp(5010);

      const duration = await epochs.getEpochDuration();

      expect(duration).eq(1000);
    });

    it(`Changing props does not change duration of old epochs`, async () => {
      const {
        signers: { TestFoundation },
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await increaseNextBlockTimestamp(10);
      expect(await epochs.getCurrentEpoch()).eq(1);
      const currentEpochDuration = await epochs.getEpochDuration();
      await epochs.connect(TestFoundation).setEpochProps(1000, 1000);
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
      const {
        signers: { TestFoundation },
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const epochs = await setupEpochs(start);
      await epochs.connect(TestFoundation).setEpochProps(7000, 3000);

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
    await expect(epochs.connect(Darth).setEpochProps(0, 0)).revertedWith(
      'HN:Common/unauthorized-caller',
    );
  });

  it('Cannot change props when decision window is bigger than epoch duration', async () => {
    const {
      epochs,
      signers: { TestFoundation },
    } = testEnv;
    await expect(epochs.connect(TestFoundation).setEpochProps(1000, 2000)).revertedWith(
      'HN:Epochs/decision-window-bigger-than-duration',
    );
  });
});
