import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EPOCHS } from '../helpers/constants';
import { increaseNextBlockTimestamp, getLatestBlockTimestamp } from '../helpers/misc-utils';
import { Epochs } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(EPOCHS, (testEnv) => {

  const epochDuration = 5000;
  const decisionWindow = 2000;

  async function setupEpochs(start: number) {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    return await epochsFactory.deploy(start, epochDuration, decisionWindow) as Epochs;
  }

  describe('Epoch duration', () => {
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

    parameters.forEach((param) => {
      it(`Epoch num is: ${param.result} when next block timestamp increased by: ${param.increaseNextBlockTsBy}`, async () => {
        const start = await getLatestBlockTimestamp() + 1;
        const epochs = await setupEpochs(start);

        await increaseNextBlockTimestamp(param.increaseNextBlockTsBy);
        const currentEpoch = await epochs.getCurrentEpoch();

        expect(currentEpoch).eq(param.result);
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

    parameters.forEach((param) => {

      it(`isDecisionWindowOpen: ${param.result} when next block timestamp increased by: ${param.increaseNextBlockTsBy}`, async () => {
        const start = await getLatestBlockTimestamp() + 1;
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
      const start = await getLatestBlockTimestamp() + 10;
      const epochs = await setupEpochs(start);

      const isOpen = await epochs.isStarted();

      expect(isOpen).false;
    });
  });

  it('Cannot change epoch duration if not an owner', async () => {
    const { epochs, signers: { hacker } } = testEnv;
    expect(epochs.connect(hacker).setEpochDuration(0))
      .revertedWith('Ownable: caller is not the owner');
  });

  it('Cannot change decision window if not an owner', async () => {
    const { epochs, signers: { hacker } } = testEnv;
    expect(epochs.connect(hacker).setDecisionWindow(0))
      .revertedWith('Ownable: caller is not the owner');
  });
});
