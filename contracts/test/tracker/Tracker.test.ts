import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';

import { UserNames, testScenarios } from './trackerTestParameters';
import { toWei } from './utils';

import { TRACKER } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(TRACKER, testEnv => {
  describe('Effective deposits, total', async () => {
    it('totalDepositAt summs for simple cases', async () => {
      const { token, glmDeposits, epochs, signers, tracker } = testEnv;
      const participants = [signers.Alice, signers.Bob];
      for (let i = 0; i < participants.length; i++) {
        // Following actions need to be done in sequence, hence await in for instead of Promise.all.
        /* eslint-disable no-await-in-loop */
        await token.transfer(participants[i].address, parseEther('1000'));
        await token.connect(participants[i]).approve(glmDeposits.address, parseEther('1000'));
        await glmDeposits.connect(participants[i]).lock(parseEther('1000'));
        /* eslint-enable no-await-in-loop */
      }
      expect(await tracker.totalDeposit()).eq(parseEther('2000'));
      expect(await tracker.totalDepositAt(1)).eq(parseEther('0'));
      await forwardEpochs(epochs, 1);
      expect(await tracker.totalDepositAt(2)).eq(parseEther('2000'));
    });
  });

  describe('Test config sanity check', async () => {
    it('signers are distinct', async () => {
      const { signers } = testEnv;
      const configured = new Set();
      for (const name of UserNames) {
        configured.add(signers[name].address);
      }
      expect(configured.size).eq(3);
    });
  });

  describe('Effective deposits', async () => {
    testScenarios.forEach(testScenario => {
      it(`${testScenario.desc}`, async () => {
        const { token, glmDeposits, signers, epochs, tracker } = testEnv;
        const currentEpoch = await epochs.getCurrentEpoch();
        expect(currentEpoch, 'fresh test always starts from epoch one').eq(1);
        for (const userName of UserNames) {
          // Following actions need to be done in sequence, hence await in for instead of Promise.all.
          /* eslint-disable no-await-in-loop */
          await token.transfer(signers[userName].address, parseEther('10000'));
          await token.connect(signers[userName]).approve(glmDeposits.address, parseEther('10000'));
          /* eslint-enable no-await-in-loop */
        }

        for (let i = 0; i < testScenario.steps.length; i++) {
          const step = testScenario.steps[i];

          if (step.userAllocation !== undefined) {
            const { name, value } = step.userAllocation;
            const allocationValueInWei = toWei(value);
            // Following actions need to be done in sequence, hence await in for instead of Promise.all.
            /* eslint-disable no-await-in-loop */
            // eslint-disable-next-line chai-friendly/no-unused-expressions
            value > 0
              ? await glmDeposits.connect(signers[name]).lock(allocationValueInWei)
              : await glmDeposits.connect(signers[name]).unlock(allocationValueInWei);
            /* eslint-enable no-await-in-loop */
          }
          if (step.forwardEpochs) {
            // Following actions need to be done in sequence, hence await in for instead of Promise.all.
            // eslint-disable-next-line no-await-in-loop
            await forwardEpochs(epochs, step.forwardEpochs);
          }
        }

        for (let i = 0; i < testScenario.checks.length; i++) {
          // test if at epochNo effective deposit has particular value
          const check = testScenario.checks[i];
          const { userExpect, epoch, expectedTotal } = check;

          if (userExpect) {
            const { name, value } = userExpect;
            const signer = signers[name];
            const valueEther = parseEther(value.toString());
            // Following actions need to be done in sequence, hence await in for instead of Promise.all.
            // eslint-disable-next-line no-await-in-loop
            const promise = await tracker.depositAt(signer.address, epoch);
            expect(promise, `ED ${value} at epoch ${epoch} should be equal to ${valueEther}`).eq(
              valueEther,
            );
          }

          if (expectedTotal) {
            const expD = parseEther(expectedTotal.toString());
            // Following actions need to be done in sequence, hence await in for instead of Promise.all.
            // eslint-disable-next-line no-await-in-loop
            const promise = await tracker.totalDepositAt(epoch);
            expect(promise, `TED at epoch ${epoch} should be equal to ${expD}`).eq(expD);
          }
        }
      });
    });
  });

  describe('GLM supply is being tracked', async () => {
    it('tokenSupplyAt when forwarding', async () => {
      const { epochs, tracker } = testEnv;
      await forwardEpochs(epochs, 10);
      expect(await tracker.tokenSupplyAt(5)).gt(0);
    });

    it('tokenSupplyAt works for zero case', async () => {
      const { tracker } = testEnv;
      expect(await tracker.tokenSupplyAt(1)).gt(0);
    });

    it("tokenSupplyAt can't peek into the future", async () => {
      const { token, glmDeposits, signers, tracker } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(tracker.tokenSupplyAt(10)).to.be.revertedWith('HN:Tracker/future-is-unknown');
    });

    it("Can read value in 'silent' epochs", async () => {
      const { epochs, token, glmDeposits, signers, tracker } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(await epochs.getCurrentEpoch(), 'first epoch number').eq(1);
      await forwardEpochs(epochs, 10);
      expect(await epochs.getCurrentEpoch(), 'eleventh number number').eq(11);
      await tracker.tokenSupplyAt(4);
    });
  });

  describe('Effective deposits, edge cases', async () => {
    it("depositAt can't peek into the future", async () => {
      const { token, glmDeposits, signers, tracker } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).lock(1000);
      expect(tracker.depositAt(signers.Alice.address, 10)).to.be.revertedWith(
        'HN:Tracker/future-is-unknown',
      );
    });
    it('tracker accepts calls only from deposits', async () => {
      const { signers, tracker } = testEnv;
      expect(
        tracker.connect(signers.Darth).processLock(signers.Darth.address, 0, parseEther('100000')),
      ).to.be.revertedWith('HN:Common/unauthorized-caller');
      expect(
        tracker
          .connect(signers.Darth)
          .processUnlock(signers.Darth.address, 0, parseEther('100000')),
      ).to.be.revertedWith('HN:Common/unauthorized-caller');
    });
  });
});
