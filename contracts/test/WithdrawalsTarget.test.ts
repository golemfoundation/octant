import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { WITHDRAWALS_TARGET } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { sendETH } from '../helpers/target-utils';

makeTestsEnv(WITHDRAWALS_TARGET, testEnv => {
  describe('ETH withdrawals', () => {
    it('multisig can withdraw unstaked', async () => {
      const {
        target,
        signers: { Darth, TestFoundation },
      } = testEnv;

      // target has some funds
      await sendETH(target, 1);

      // Darth can't withdraw
      await expect(target.connect(Darth).withdrawUnstaked(parseEther('0'))).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );

      // Deployer can withdraw
      await target.connect(TestFoundation).withdrawUnstaked(parseEther('1'));
    });

    it('Any account can withdraw from target to octant vault', async () => {
      const { octantOracle, payoutsManager, epochs, target } = testEnv;

      await sendETH(target, 1);
      await forwardEpochs(epochs, 1);
      await octantOracle.writeBalance();
      expect(await ethers.provider.getBalance(target.address)).eq(0);
      expect(await ethers.provider.getBalance(payoutsManager.address)).eq(
        ethers.utils.parseEther('1.0'),
      );
    });
  });
});
