import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { DEPOSITS } from '../helpers/constants';
import { increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe('Faucet', async () => {

    it('Can withdraw GLM', async () => {
      const { token, faucet, signers: { Alice } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendMeGLM();

      expect(await token.balanceOf(Alice.address)).eq(parseEther('1000'));
    });

    it('Can\'t withdrawn twice in 24 hours', async () => {
      const { token, faucet, signers: { Alice } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendMeGLM();

      expect(faucet.connect(Alice).sendMeGLM()).to.be.revertedWith(
        'HN/must-wait-24-hours-since-last-withdraw'
      );
    });

    it('Can withdrawn after 24 hours', async () => {
      const { token, faucet, signers: { Alice } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendMeGLM();
      await increaseNextBlockTimestamp(86400);
      await faucet.connect(Alice).sendMeGLM();

      expect(await token.balanceOf(Alice.address)).eq(parseEther('2000'));
    });

    it('Can send GLM to recipient', async () => {
      const { token, faucet, signers: { Alice, Bob } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendGLM(Bob.address);

      expect(await token.balanceOf(Alice.address)).eq(0);
      expect(await token.balanceOf(Bob.address)).eq(parseEther('1000'));
    });

    it('Can\'t send to recipient twice in 24 hours', async () => {
      const { token, faucet, signers: { Alice, Bob } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendGLM(Bob.address);

      expect(faucet.connect(Alice).sendGLM(Bob.address)).to.be.revertedWith(
        'HN/must-wait-24-hours-since-last-withdraw'
      );
    });

    it('Can send to recipient after 24 hours', async () => {
      const { token, faucet, signers: { Alice, Bob } } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendGLM(Bob.address);
      await increaseNextBlockTimestamp(86400);
      await faucet.connect(Alice).sendGLM(Bob.address);

      expect(await token.balanceOf(Alice.address)).eq(0);
      expect(await token.balanceOf(Bob.address)).eq(parseEther('2000'));
    });
  });
});
