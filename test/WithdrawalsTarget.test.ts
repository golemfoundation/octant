import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers, deployments } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { WITHDRAWALS_TARGET } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { WithdrawalsTargetV3 } from '../typechain-types';

/* eslint no-console: 0 */

class NoExpectedError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = NoExpectedError.name; // stack traces display correctly now
  }
}

makeTestsEnv(WITHDRAWALS_TARGET, testEnv => {
  describe('Basic deployment', () => {
    it('Version is set to 1', async () => {
      const { target } = testEnv;
      expect(await target.version()).eq(1);
    });
  });

  describe('upgrade', () => {
    it('basic upgrade', async () => {
      const {
        target,
        signers: { deployer },
      } = testEnv;

      const oldAddr = target.address;
      expect(await target.version()).eq(1);

      const { deploy } = deployments;
      const deployRes = await deploy('WithdrawalsTarget', {
        contract: 'WithdrawalsTargetV3',
        from: deployer.address,
        proxy: true,
      });
      const targetV3 = await ethers.getContractAt('WithdrawalsTargetV3', deployRes.address);
      // sanity check: storage addr must be the same
      expect(deployRes.address).eq(oldAddr);
      // sanity check: version number has changed
      expect(await targetV3.version()).eq(3);
    });

    it('multisig can withdraw', async () => {
      const {
        signers: { deployer, Darth, TestFoundation },
      } = testEnv;
      const { deploy } = deployments;
      const deployRes = await deploy('WithdrawalsTarget', {
        contract: 'WithdrawalsTargetV3',
        from: deployer.address,
        proxy: true,
      });
      const targetV3 = await ethers.getContractAt('WithdrawalsTargetV3', deployRes.address);
      await targetV3.setMultisig(TestFoundation.address);

      // target has some funds
      await targetV3.sendETH({ value: parseEther('1.0') });

      // Alice can't withdraw
      expect(targetV3.connect(Darth).withdrawUnstaked(parseEther('0'))).to.be.revertedWith(
        'HN:WithdrawalsTarget/unauthorized-caller',
      );

      // Deployer can withdraw
      await targetV3.connect(TestFoundation).withdrawUnstaked(parseEther('1'));
    });

    it('only original deployer can upgrade', async () => {
      const { signers } = testEnv;
      const { deploy } = deployments;
      try {
        await deploy('WithdrawalsTarget', {
          contract: 'WithdrawalsTargetV2',
          from: signers.Alice.address,
          proxy: true,
        });
        throw new NoExpectedError('Expected deployment to fail due to wrong owner');
      } catch (e) {
        if (e instanceof NoExpectedError) {
          throw e;
        }
      }
    });
  });

  describe('ETH withdrawals', () => {
    it('Smoke test', async () => {
      const {
        octantOracle,
        payoutsManager,
        epochs,
        signers: { deployer, TestFoundation },
      } = testEnv;
      const { deploy } = deployments;

      const t = await deploy('WithdrawalsTarget', {
        contract: 'WithdrawalsTargetV3',
        from: deployer.address,
        proxy: true,
      });
      const target: WithdrawalsTargetV3 = await ethers.getContractAt(
        'WithdrawalsTargetV3',
        t.address,
      );
      expect(await target.version()).eq(3);
      await target.setMultisig(TestFoundation.address);
      await target.connect(TestFoundation).setOctant(octantOracle.address);
      await target.sendETH({ value: ethers.utils.parseEther('1.0') });
      await forwardEpochs(epochs, 1);
      await octantOracle.writeBalance();
      expect(await ethers.provider.getBalance(target.address)).eq(0);
      expect(await ethers.provider.getBalance(payoutsManager.address)).eq(
        ethers.utils.parseEther('1.0'),
      );
    });
  });
});
