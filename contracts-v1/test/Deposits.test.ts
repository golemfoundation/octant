import { expect } from 'chai';

import { makeTestsEnv } from './helpers/make-tests-env';

import { DEPOSITS } from '../helpers/constants';

makeTestsEnv(DEPOSITS, testEnv => {
  describe('Deposits', async () => {
    it('No deposits in freshly deployed contract', async () => {
      const { glmDeposits, signers } = testEnv;
      expect(await glmDeposits.connect(signers.Charlie).deposits(signers.Charlie.address)).to.equal(
        0,
      );
    });

    it('Can withdraw', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Charlie.address, 1005);
      await token.connect(signers.Charlie).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Charlie).lock(1000);
      expect(await token.balanceOf(signers.Charlie.address)).eq(5);
      await glmDeposits.connect(signers.Charlie).unlock(1000);
      expect(await token.balanceOf(signers.Charlie.address)).eq(1005);
    });

    it('Cannot deposit without approve', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Charlie.address, 1000);
      await expect(glmDeposits.connect(signers.Charlie).lock(1000)).to.be.revertedWith(
        'ERC20: insufficient allowance',
      );
      expect(await glmDeposits.deposits(signers.Charlie.address)).eq(0);
    });

    it('Cannot deposit zero GLMs', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Charlie.address, 1000);
      await token.connect(signers.Charlie).approve(glmDeposits.address, 1000);
      await expect(glmDeposits.connect(signers.Charlie).lock(0)).to.be.revertedWith(
        'HN:Common/invalid-argument',
      );
    });

    it("Can't withdrawn empty", async () => {
      const { glmDeposits, signers } = testEnv;
      await expect(glmDeposits.connect(signers.Charlie).unlock(1)).to.be.revertedWith(
        'HN:Deposits/deposit-is-smaller',
      );
    });

    it("Can't withdrawn not owned", async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Charlie.address, 1000);
      await token.connect(signers.Charlie).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Charlie).lock(1000);
      await expect(glmDeposits.connect(signers.Darth).unlock(1)).to.be.revertedWith(
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
      await expect(glmDeposits.connect(signers.Darth).unlock(1000)).to.be.revertedWith(
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
      await token.transfer(signers.Charlie.address, 1005);
      await token.connect(signers.Charlie).approve(glmDeposits.address, 1005);
      expect(await token.balanceOf(signers.Charlie.address)).eq(1005);
      await glmDeposits.connect(signers.Charlie).lock(1000);
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
      expect(await token.balanceOf(signers.Charlie.address)).eq(5);
      await glmDeposits.connect(signers.Charlie).lock(5);
      expect(await token.balanceOf(glmDeposits.address)).eq(1005);
    });

    it('Can withdraw partially', async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Charlie.address, 1000);
      await token.connect(signers.Charlie).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Charlie).lock(1000);
      await glmDeposits.connect(signers.Charlie).unlock(600);
      expect(await token.balanceOf(glmDeposits.address)).eq(400);
      expect(await token.balanceOf(signers.Charlie.address)).eq(600);
    });
  });
});
