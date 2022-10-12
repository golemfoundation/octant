import { expect } from 'chai';
import { DEPOSITS } from '../helpers/constants';
import { increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { makeTestsEnv } from './helpers/make-tests-env';

interface Step {
  stake?: number;
  forwardEpochs?: number;
}

interface Test {
  epoch: number;
  expectedEffectiveStake: number;
}

interface TestParam {
  steps: Step[],
  tests: Test[]
}

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe("Effective deposits, parametrized scenarios", () => {
    const parameters: TestParam[] = [
      { steps: [{stake: 1000, forwardEpochs: 10}, {stake: -1000}], tests: [{epoch: 2, expectedEffectiveStake: 1000}] },
      { steps: [{stake: 1000, forwardEpochs: 100}, {stake: -1000}], tests: [{epoch: 5, expectedEffectiveStake: 1000}] },
      { steps: [{stake: 1000, forwardEpochs: 1}, {stake: -1000, forwardEpochs: 2}], tests: [{epoch: 2, expectedEffectiveStake: 0}] },
      { steps: [], tests: [{epoch: 1, expectedEffectiveStake: 0}] },
      { steps: [{forwardEpochs: 20}, {stake: 1000}], tests: [{epoch: 1, expectedEffectiveStake: 0}] },
      { steps: [{stake: 1000, forwardEpochs: 1}, {stake: 100, forwardEpochs: 3}], tests: [{epoch: 2, expectedEffectiveStake: 1000}, {epoch: 4, expectedEffectiveStake: 1100}] },
      { steps: [{stake: 1000, forwardEpochs: 1}, {stake: 1000}], tests: [{epoch: 1, expectedEffectiveStake: 0}, {epoch: 2, expectedEffectiveStake: 1000}] },
      { steps: [{stake: 1000, forwardEpochs: 5}], tests: [{epoch: 2, expectedEffectiveStake: 1000}] },
      { steps: [{stake: 1000, forwardEpochs: 1}, {stake: -500}], tests: [{epoch: 2, expectedEffectiveStake: 500}] },
    ];
    parameters.forEach((param, id) => {
      it(`Effective deposit testing scenario ${id}`, async () => {
        const { token, glmDeposits, signers, epochs } = testEnv;
        let epochDuration = await epochs.epochDuration();
        await token.transfer(signers.user.address, 10000);
        await token.connect(signers.user).approve(glmDeposits.address, 10000);

        for (let i = 0; i < param.steps.length; i++) {
          let step = param.steps[i];
          if (step.stake! > 0) {
            await glmDeposits.connect(signers.user).deposit(step.stake!);
          }
          if (step.stake! < 0) {
            await glmDeposits.connect(signers.user).withdraw(-step.stake!);
          }
          if (step.forwardEpochs) {
            // forward time
            let timeDelta = epochDuration.toNumber() * step.forwardEpochs;
            await increaseNextBlockTimestamp(timeDelta);
          }
        }

        for (let probeId = 0; probeId < param.tests.length; probeId++) {
          // test if at epochNo effective stake has particular value
          let probe = param.tests[probeId];
          let promise = await glmDeposits.stakeAt(signers.user.address, probe.epoch);
          expect(promise).eq(probe.expectedEffectiveStake);
        }
      });
    });
  });

  describe("Effective deposits, stakeAt edge cases", async () => {
    it("stakeAt can't peek into the future", async () => {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.user.address, 1005);
      await token.connect(signers.user).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.user).deposit(1000);
      await expect(glmDeposits.stakeAt(signers.user.address, 10)).to.be.revertedWith("HN/future-is-unknown");
    });
  });

  describe("Deposits", async () => {
    it("No deposits in freshly deployed contract", async function () {
      const { glmDeposits, signers } = testEnv;
      expect(await glmDeposits.connect(signers.user).deposits(signers.user.address)).to.equal(0);
    });
    it("Can withdrawn", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.user.address, 1005);
      await token.connect(signers.user).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.user).deposit(1000);
      await expect(await token.balanceOf(signers.user.address)).eq(5);
      await glmDeposits.connect(signers.user).withdraw(1000);
      await expect(await token.balanceOf(signers.user.address)).eq(1005);
    });
    it("Can't withdrawn empty", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await expect(glmDeposits.connect(signers.user).withdraw(1)).to.be.revertedWith("HN/deposit-is-smaller");
    });
    it("Can't withdrawn not owned", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.user.address, 1000);
      await token.connect(signers.user).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.user).deposit(1000);
      await expect(glmDeposits.connect(signers.hacker).withdraw(1)).to.be.revertedWith("HN/deposit-is-smaller");
    });
    it("Can't withdrawn twice", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.hacker.address, 1000);
      await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.hacker).deposit(1000);
      await glmDeposits.connect(signers.hacker).withdraw(1000);
      let balance = await token.balanceOf(signers.hacker.address);
      await expect(glmDeposits.connect(signers.hacker).withdraw(1000)).to.be.revertedWith("HN/deposit-is-smaller");
      await expect(await token.balanceOf(signers.hacker.address)).eq(balance);
    });
    it("Can deposit again after withdrawal", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.hacker.address, 1000);
      await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.hacker).deposit(1000);
      await glmDeposits.connect(signers.hacker).withdraw(1000);
      await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.hacker).deposit(1000);
    });
    it("Can increase deposit", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.user.address, 1005);
      await token.connect(signers.user).approve(glmDeposits.address, 1005);
      await expect(await token.balanceOf(signers.user.address)).eq(1005);
      await glmDeposits.connect(signers.user).deposit(1000);
      await expect(await token.balanceOf(glmDeposits.address)).eq(1000);
      await expect(await token.balanceOf(signers.user.address)).eq(5);
      await glmDeposits.connect(signers.user).deposit(5);
      await expect(await token.balanceOf(glmDeposits.address)).eq(1005);
    });
    it("Can withdraw partially", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.user.address, 1000);
      await token.connect(signers.user).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.user).deposit(1000);
      await glmDeposits.connect(signers.user).withdraw(600);
      await expect(await token.balanceOf(glmDeposits.address)).eq(400);
      await expect(await token.balanceOf(signers.user.address)).eq(600);
    });
  });
});
