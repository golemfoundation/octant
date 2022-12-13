import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { DEPOSITS } from '../helpers/constants';
import { increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe('Faucet', async () => {

    it('Can withdraw GLM', async () => {
      const { token, faucet, signers } = testEnv;
      await token.transfer(faucet.address, parseEther("10000"));

      await faucet.connect(signers.Alice).sendMeGLM();

      expect(await token.balanceOf(signers.Alice.address)).eq(parseEther("1000"));
    });

    it('Can\'t withdrawn twice in 24 hours', async () => {
      const { token, faucet, signers } = testEnv;
      await token.transfer(faucet.address, parseEther("10000"));

      await faucet.connect(signers.Alice).sendMeGLM();

      expect(faucet.connect(signers.Alice).sendMeGLM()).to.be.revertedWith(
        'HN/must-wait-24-hours-since-last-withdraw'
      );
    });

    it('Can withdrawn after 24 hours', async () => {
      const { token, faucet, signers } = testEnv;
      await token.transfer(faucet.address, parseEther("10000"));

      await faucet.connect(signers.Alice).sendMeGLM();
      await increaseNextBlockTimestamp(86400);
      await faucet.connect(signers.Alice).sendMeGLM();

      expect(await token.balanceOf(signers.Alice.address)).eq(parseEther("2000"));
    });
  });
});
