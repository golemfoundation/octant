import { expect } from 'chai';
import { deployments } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { WITHDRAWALS_TARGET } from '../helpers/constants';

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
    it('Owner is initialized', async () => {
      const { target } = testEnv;
      expect(await target.version()).eq(1);
    });
  });

  describe('upgrade', () => {
    it('basic upgrade', async () => {
      const { target, signers } = testEnv;

      const oldAddr = target.address;
      expect(await target.version()).eq(1);

      const { deploy } = deployments;
      const upgradedTarget = await deploy('WithdrawalsTarget', {
        contract: 'WithdrawalsTargetV2',
        from: signers.deployer.address,
        proxy: true,
      });

      // sanity check: storage addr must be the same
      expect(upgradedTarget.address).eq(oldAddr);
      // sanity check: version number has changed
      expect(await target.version()).eq(2);
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
});
