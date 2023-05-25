import { assert, expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { deployments, ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { WITHDRAWALS_TARGET, WITHDRAWALS_TARGET_TEST_V2 } from '../helpers/constants';

makeTestsEnv(WITHDRAWALS_TARGET, testEnv => {
  describe('Upgrades', () => {
    it('Version is set to 1', async () => {
      const { target } = testEnv;
      expect(await target.version()).eq(1);
    });

    it('Contract can be upgraded', async () => {
      const {
        target,
        signers: { Alice, Darth, TestFoundation },
      } = testEnv;
      const ethProceeds = parseEther('3');
      const darthBalanceBefore = await ethers.provider.getBalance(Darth.address);
      const multisigBalanceBefore = await ethers.provider.getBalance(TestFoundation.address);
      const targetAddress = target.address;
      expect(await target.version()).eq(1);

      const { deploy } = deployments;
      const deployResult = await deploy(WITHDRAWALS_TARGET, {
        contract: WITHDRAWALS_TARGET_TEST_V2,
        from: TestFoundation.address,
        proxy: true,
      });
      expect(deployResult.address).eq(targetAddress);

      // target has some funds
      await Alice.sendTransaction({ to: target.address, value: ethProceeds });

      const targetV2 = await ethers.getContractAt(WITHDRAWALS_TARGET_TEST_V2, targetAddress);

      // Darth can't call targetV2
      await expect(targetV2.connect(Darth).withdraw(ethProceeds)).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
      await expect(targetV2.connect(Darth).setGreeting('Hello from Darth')).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );

      // Multisig can call targetV2
      await targetV2.connect(TestFoundation).withdraw(ethProceeds);
      await targetV2.connect(TestFoundation).setGreeting('Hello from multisig');

      const darthBalanceAfter = await ethers.provider.getBalance(Darth.address);
      expect(darthBalanceBefore).approximately(darthBalanceAfter, parseEther('0.001'));

      const multisigBalanceAfter = await ethers.provider.getBalance(TestFoundation.address);
      expect(multisigBalanceAfter).approximately(
        multisigBalanceBefore.add(ethProceeds),
        parseEther('0.001'),
      );
      expect(await targetV2.version()).eq(2);
      expect(await targetV2.test()).eq('Hello from multisig');
    });

    it('Only multisig can upgrade', async () => {
      const {
        signers: { Darth },
      } = testEnv;
      const { deploy } = deployments;

      try {
        await deploy(WITHDRAWALS_TARGET, {
          contract: WITHDRAWALS_TARGET_TEST_V2,
          from: Darth.address,
          proxy: true,
        });
        assert.fail('Expected an error to be thrown, but none was thrown.');
      } catch (e: any) {
        assert.equal(
          e.message,
          'To change owner/admin, you need to call the proxy directly, it currently is 0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        );
      }
    });
  });

  describe('Withdrawals', () => {
    it('Only multisig can withdraw', async () => {
      const {
        target,
        signers: { Alice, Darth, TestFoundation },
      } = testEnv;

      const ethProceeds = parseEther('3');
      const darthBalanceBefore = await ethers.provider.getBalance(Darth.address);
      const multisigBalanceBefore = await ethers.provider.getBalance(TestFoundation.address);

      // target has some funds
      await Alice.sendTransaction({ to: target.address, value: ethProceeds });

      // Darth can't withdraw
      await expect(target.connect(Darth).withdraw(ethProceeds)).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );

      // Multisig can withdraw
      await target.connect(TestFoundation).withdraw(ethProceeds);

      const darthBalanceAfter = await ethers.provider.getBalance(Darth.address);
      expect(darthBalanceBefore).approximately(darthBalanceAfter, parseEther('0.001'));

      const multisigBalanceAfter = await ethers.provider.getBalance(TestFoundation.address);
      expect(multisigBalanceAfter).approximately(
        multisigBalanceBefore.add(ethProceeds),
        parseEther('0.001'),
      );
    });
  });
});
