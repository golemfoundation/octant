import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EPOCHS } from '../helpers/constants';
import { mineBlocks, getCurrentBlockNumber } from '../helpers/misc-utils';
import { Epochs } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(EPOCHS, (testEnv) => {

  const epochDuration = 5000;
  const decisionWindow = 2000;

  async function setupEpochs(start: number) {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    return await epochsFactory.deploy(start, epochDuration, decisionWindow) as Epochs;
  }

  describe('Epoch numbering', () => {
    it("Starts from 1", async () => {
      const start = await getCurrentBlockNumber();
      const epochs = await setupEpochs(start);

      expect(await epochs.getCurrentEpoch()).eq(1);
    });
  });

  describe('Epoch duration', () => {
    const parameters = [
      { mineBlocks: 0, result: 1 },
      { mineBlocks: 100, result: 1 },
      { mineBlocks: 2000, result: 1 },
      { mineBlocks: 4990, result: 1 },
      { mineBlocks: 5010, result: 2 },
      { mineBlocks: 7010, result: 2 },
      { mineBlocks: 9990, result: 2 },
      { mineBlocks: 10020, result: 3 },
    ];

    parameters.forEach((param) => {
      it(`Epoch num is: ${param.result} when next ${param.mineBlocks} blocks are mined`, async () => {
        const start = await getCurrentBlockNumber() + 1;
        const epochs = await setupEpochs(start);

        await mineBlocks(param.mineBlocks);
        const currentEpoch = await epochs.getCurrentEpoch();

        expect(currentEpoch).eq(param.result);
      });
    });
  });

  describe('Decision window', () => {
    const parameters = [
      { mineBlocks: 0, result: true },
      { mineBlocks: 100, result: true },
      { mineBlocks: 1990, result: true },
      { mineBlocks: 3010, result: false },
      { mineBlocks: 5010, result: true },
      { mineBlocks: 7010, result: false },
      { mineBlocks: 9990, result: false },
      { mineBlocks: 10020, result: true },
    ];

    parameters.forEach((param) => {

      it(`isDecisionWindowOpen: ${param.result} when next ${param.mineBlocks} are mined`, async () => {
        const start = await getCurrentBlockNumber() + 1;
        const epochs = await setupEpochs(start);

        await mineBlocks(param.mineBlocks);
        const isOpen = await epochs.isDecisionWindowOpen();

        expect(isOpen).eq(param.result);
      });
    });
  });

  describe('Is started', () => {
    it(`should be started`, async () => {
      const start = await getCurrentBlockNumber();
      const epochs = await setupEpochs(start);

      await mineBlocks(10);
      const isStarted = await epochs.isStarted();

      expect(isStarted).true;
    });

    it(`should not be started`, async () => {
      const start = await getCurrentBlockNumber() + 10;
      const epochs = await setupEpochs(start);

      const isStarted = await epochs.isStarted();

      expect(isStarted).false;
    });
  });

  it('Cannot change epoch duration if not an owner', async () => {
    const { epochs, signers: { Darth } } = testEnv;
    expect(epochs.connect(Darth).setEpochDuration(0))
      .revertedWith('Ownable: caller is not the owner');
  });

  it('Cannot change decision window if not an owner', async () => {
    const { epochs, signers: { Darth } } = testEnv;
    expect(epochs.connect(Darth).setDecisionWindow(0))
      .revertedWith('Ownable: caller is not the owner');
  });
});
