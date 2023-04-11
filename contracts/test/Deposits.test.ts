import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { AUTH, DEPOSITS, TOKEN, TRACKER_WRAPPER } from '../helpers/constants';
import { Deposits, Tracker, TrackerWrapper } from '../typechain';

makeTestsEnv(DEPOSITS, testEnv => {
  async function setupDeposits(): Promise<{
    glmDeposits: Deposits;
    sTracker: FakeContract<Tracker>;
  }> {
    const trackerWrapperFactory = await ethers.getContractFactory(TRACKER_WRAPPER);
    const depositsFactory = await ethers.getContractFactory(DEPOSITS);
    const token = await ethers.getContract(TOKEN);
    const auth = await ethers.getContract(AUTH);

    const sTracker = await smock.fake<Tracker>('Tracker');
    const glmDeposits: Deposits = (await depositsFactory.deploy(
      token.address,
      auth.address,
    )) as Deposits;
    const trackerWrapper: TrackerWrapper = (await trackerWrapperFactory.deploy(
      sTracker.address,
      glmDeposits.address,
    )) as TrackerWrapper;
    await glmDeposits.setTrackerAddress(trackerWrapper.address);

    return { glmDeposits, sTracker };
  }

  describe('Deposits', async () => {
    it('No deposits in freshly deployed contract', async () => {
      const { glmDeposits, signers } = testEnv;
      expect(await glmDeposits.connect(signers.Alice).deposits(signers.Alice.address)).to.equal(0);
    });

    it('Can withdrawn', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).unlock(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
    });

    it("Can't withdrawn empty", async () => {
      const { glmDeposits, signers } = testEnv;
      expect(glmDeposits.connect(signers.Alice).unlock(1)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller',
      );
    });

    it("Can't withdrawn not owned", async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(glmDeposits.connect(signers.Darth).unlock(1)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller',
      );
    });

    it("Can't withdrawn twice", async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).lock(1000);
      await glmDeposits.connect(signers.Darth).unlock(1000);
      const balance = await token.balanceOf(signers.Darth.address);
      expect(glmDeposits.connect(signers.Darth).unlock(1000)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller',
      );
      expect(await token.balanceOf(signers.Darth.address)).eq(balance);
    });

    it('Can deposit again after withdrawal', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).lock(1000);
      await glmDeposits.connect(signers.Darth).unlock(1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).lock(1000);
    });

    it('Can increase deposit', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1005);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).lock(5);
      expect(await token.balanceOf(glmDeposits.address)).eq(1005);
    });

    it('Can withdraw partially', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      await glmDeposits.connect(signers.Alice).unlock(600);
      expect(await token.balanceOf(glmDeposits.address)).eq(400);
      expect(await token.balanceOf(signers.Alice.address)).eq(600);
    });

    it('reverts deposit when it`s out of gas', async () => {
      const {
        token,
        glmDeposits,
        signers: { Alice },
      } = testEnv;
      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);

      expect(glmDeposits.connect(Alice).lock(1000, { gasLimit: 100_000 })).to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });

    it('Reverts deposit when it`s other error', async () => {
      const {
        token,
        signers: { Alice },
      } = testEnv;
      const { sTracker, glmDeposits } = await setupDeposits();
      sTracker.processLock.reverts();

      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      expect(glmDeposits.connect(Alice).lock(1000)).to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });

    it('reverts withdrawal when it`s out of gas', async () => {
      const {
        token,
        glmDeposits,
        signers: { Alice },
      } = testEnv;
      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(Alice).lock(1000);

      expect(glmDeposits.connect(Alice).unlock(1000, { gasLimit: 50_000 })).to.be.reverted;
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
    });

    it('does not revert withdraw when it`s other error', async () => {
      const {
        token,
        signers: { Alice },
      } = testEnv;
      const { sTracker, glmDeposits } = await setupDeposits();
      sTracker.processUnlock.reverts();

      await token.transfer(Alice.address, 1000);
      await token.connect(Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(Alice).lock(1000);

      await expect(glmDeposits.connect(Alice).unlock(1000)).emit(glmDeposits, 'TrackerFailed');
      expect(await token.balanceOf(glmDeposits.address)).eq(0);
    });
  });
});
