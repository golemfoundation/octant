import { expect } from 'chai';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp, increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { Epochs } from '../typechain-types';

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
    const parameters = [
      {
        firstDurationChange: 5000,
        firstIncreaseNextBlockTsBy: 0,
        firstResult: 1,
        secondDurationChange: 5000,
        secondIncreaseNextBlockTsBy: 0,
        secondResult: 1,
      },
      {
        firstDurationChange: 3000,
        firstIncreaseNextBlockTsBy: 1500,
        firstResult: 1,
        secondDurationChange: 3000,
        secondIncreaseNextBlockTsBy: 1000,
        secondResult: 1,
      },
      {
        firstDurationChange: 3000,
        firstIncreaseNextBlockTsBy: 2000,
        firstResult: 1,
        secondDurationChange: 3000,
        secondIncreaseNextBlockTsBy: 3010,
        secondResult: 2,
      },
      {
        firstDurationChange: 2000,
        firstIncreaseNextBlockTsBy: 5500,
        firstResult: 2,
        secondDurationChange: 1000,
        secondIncreaseNextBlockTsBy: 2000,
        secondResult: 3,
      },
      {
        firstDurationChange: 2000,
        firstIncreaseNextBlockTsBy: 5500,
        firstResult: 2,
        secondDurationChange: 1000,
        secondIncreaseNextBlockTsBy: 3490,
        secondResult: 4,
      },
      {
        firstDurationChange: 7000,
        firstIncreaseNextBlockTsBy: 11000,
        firstResult: 2,
        secondDurationChange: 5000,
        secondIncreaseNextBlockTsBy: 2000,
        secondResult: 3,
      },
      {
        firstDurationChange: 7000,
        firstIncreaseNextBlockTsBy: 11000,
        firstResult: 2,
        secondDurationChange: 5000,
        secondIncreaseNextBlockTsBy: 7000,
        secondResult: 4,
      },
      {
        firstDurationChange: 7000,
        firstIncreaseNextBlockTsBy: 13000,
        firstResult: 3,
        secondDurationChange: 5000,
        secondIncreaseNextBlockTsBy: 11010,
        secondResult: 5,
      },
    ];

    parameters.forEach(param => {
      it(`Epoch num is: ${param.firstResult} when next block timestamp increased by: ${param.firstIncreaseNextBlockTsBy}
       and epoch duration is changed by: ${param.firstDurationChange};
       Epoch num is: ${param.secondResult} when next block timestamp increased by: ${param.secondIncreaseNextBlockTsBy}
       and epoch duration is changed by: ${param.secondDurationChange} `, async () => {
        const start = await getLatestBlockTimestamp();
        const epochs = await setupEpochs(start);

        await epochs.setEpochProps(param.firstDurationChange, 1000);

        await increaseNextBlockTimestamp(param.firstIncreaseNextBlockTsBy);
        const currentEpochAfterFirstChange = await epochs.getCurrentEpoch();
        expect(currentEpochAfterFirstChange).eq(param.firstResult);

        await epochs.setEpochProps(param.secondDurationChange, 1000);

        await increaseNextBlockTimestamp(param.secondIncreaseNextBlockTsBy);
        const currentEpochAfterSecondChange = await epochs.getCurrentEpoch();
        expect(currentEpochAfterSecondChange).eq(param.secondResult);
      });
    });
  });

  describe('Decision window', () => {
    const parameters = [
      { increaseNextBlockTsBy: 0, result: true },
      { increaseNextBlockTsBy: 100, result: true },
      { increaseNextBlockTsBy: 1990, result: true },
      { increaseNextBlockTsBy: 3010, result: false },
      { increaseNextBlockTsBy: 5010, result: true },
      { increaseNextBlockTsBy: 7010, result: false },
      { increaseNextBlockTsBy: 9990, result: false },
      { increaseNextBlockTsBy: 10020, result: true },
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
