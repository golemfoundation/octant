import { expect } from 'chai';

import { makeTestsEnv } from './helpers/make-tests-env';

import { DEPOSITS } from '../helpers/constants';

makeTestsEnv(DEPOSITS, testEnv => {
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
  });
});
