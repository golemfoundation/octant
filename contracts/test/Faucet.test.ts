import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';

import { makeTestsEnv } from './helpers/make-tests-env';

import { DEPOSITS } from '../helpers/constants';

makeTestsEnv(DEPOSITS, testEnv => {
  describe('Faucet', async () => {
    it('Can withdraw GLM', async () => {
      const {
        token,
        faucet,
        signers: { Alice },
      } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendMeGLM();

      expect(await token.balanceOf(Alice.address)).eq(parseEther('1000'));
    });

    it('Can withdraw twice', async () => {
      const {
        token,
        faucet,
        signers: { Alice },
      } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendMeGLM();
      await faucet.connect(Alice).sendMeGLM();

      expect(await token.balanceOf(Alice.address)).eq(parseEther('2000'));
    });

    it('Can send GLM to recipient', async () => {
      const {
        token,
        faucet,
        signers: { Alice, Bob },
      } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendGLM(Bob.address);

      expect(await token.balanceOf(Alice.address)).eq(0);
      expect(await token.balanceOf(Bob.address)).eq(parseEther('1000'));
    });

    it('Can send to recipient twice', async () => {
      const {
        token,
        faucet,
        signers: { Alice, Bob },
      } = testEnv;
      await token.transfer(faucet.address, parseEther('10000'));

      await faucet.connect(Alice).sendGLM(Bob.address);
      await faucet.connect(Alice).sendGLM(Bob.address);

      expect(await token.balanceOf(Alice.address)).eq(0);
      expect(await token.balanceOf(Bob.address)).eq(parseEther('2000'));
    });
  });
});
