import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DEPOSITS, TOKEN, TRACKER_WRAPPER } from '../helpers/constants';
import { Deposits, Tracker, TrackerWrapper } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  async function setupDeposits(): Promise<{ sTracker: FakeContract<Tracker>, glmDeposits: Deposits }> {
    const trackerWrapperFactory = await ethers.getContractFactory(TRACKER_WRAPPER);
    const depositsFactory = await ethers.getContractFactory(DEPOSITS);
    const token = await ethers.getContract(TOKEN);

    const sTracker = await smock.fake<Tracker>('Tracker');
    const glmDeposits: Deposits = await depositsFactory.deploy(token.address) as Deposits;
    const trackerWrapper: TrackerWrapper = await trackerWrapperFactory.deploy(sTracker.address, glmDeposits.address) as TrackerWrapper;
    await glmDeposits.setDepositTrackerAddress(trackerWrapper.address);

    return { sTracker, glmDeposits };
  }

  describe('Deposits', async () => {
    it('No deposits in freshly deployed contract', async function () {
      const { glmDeposits, signers } = testEnv;
      expect(await glmDeposits.connect(signers.Alice).deposits(signers.Alice.address)).to.equal(0);
    });

    it('Can withdrawn', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).withdraw(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
    });

    it('Can\'t withdrawn empty', async function () {
      const { glmDeposits, signers } = testEnv;
      expect(glmDeposits.connect(signers.Alice).withdraw(1)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller'
      );
    });

    it('Can\'t withdrawn not owned', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(glmDeposits.connect(signers.Darth).withdraw(1)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller'
      );
    });

    it('Can\'t withdrawn twice', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
      await glmDeposits.connect(signers.Darth).withdraw(1000);
      let balance = await token.balanceOf(signers.Darth.address);
      expect(glmDeposits.connect(signers.Darth).withdraw(1000)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller'
      );
      expect(await token.balanceOf(signers.Darth.address)).eq(balance);
    });

    it('Can deposit again after withdrawal', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
      await glmDeposits.connect(signers.Darth).withdraw(1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
    });

    it('Can increase deposit', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1005);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).deposit(5);
      expect(await token.balanceOf(glmDeposits.address)).eq(1005);
    });

    it('Can withdraw partially', async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      await glmDeposits.connect(signers.Alice).withdraw(600);
      expect(await token.balanceOf(glmDeposits.address)).eq(400);
      expect(await token.balanceOf(signers.Alice.address)).eq(600);
    });

    it('reverts deposit when it`s out of gas', async function () {
      const { token, glmDeposits, signers: { Alice } } = testEnv;
      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);

      expect(glmDeposits.connect(Alice).deposit(1000, { gasLimit: 100_000 }))
        .to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });

    it('Reverts deposit when it`s other error', async function () {
      const { token, signers: { Alice } } = testEnv;
      const { sTracker, glmDeposits } = await setupDeposits();
      sTracker.processDeposit.reverts();

      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      expect(glmDeposits.connect(Alice).deposit(1000))
        .to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });

    it('reverts withdrawal when it`s out of gas', async function () {
      const { token, glmDeposits, signers: { Alice } } = testEnv;
      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(Alice).deposit(1000);

      expect(glmDeposits.connect(Alice).withdraw(1000, { gasLimit: 50_000 }))
        .to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
    });

    it('does not revert withdraw when it`s other error', async function () {
      const { token, signers: { Alice } } = testEnv;
      const { sTracker, glmDeposits } = await setupDeposits();
      sTracker.processWithdraw.reverts();

      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(Alice).deposit(1000);

      await expect(glmDeposits.connect(Alice).withdraw(1000))
        .emit(glmDeposits, 'TrackerFailed');
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });
  });
});
