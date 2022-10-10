import { expect } from "chai";
import { off } from "process";
import { increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { DEPOSITS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe("Effective deposits", () => {
    const parameters = [
      { id: 1, seq: [1000, ["t", 10], -1000], test: [[2, 1000]] },
      { id: 2, seq: [1000, ["t", 100], -1000], test: [[5, 1000]] },
      { id: 3, seq: [1000, ["t", 1], -1000, ["t", 2]], test: [[2, 0]] },
      { id: 4, seq: [], test: [[1, 0]] },
      { id: 5, seq: [["t", 20], 1000], test: [[1, 0]] },
      { id: 6, seq: [1000, ["t", 1], 100, ["t", 3]], test: [[2, 1000], [4, 1100]] },
      { id: 7, seq: [1000, ["t", 1], 1000], test: [[1, 0], [2, 1000]] },
      { id: 8, seq: [1000, ["t", 5]], test: [[2, 1000]] },
    ];
    parameters.forEach((param) => {
      it(`Effective deposit testing scenario ${param.id}`, async () => {
        const { token, glmDeposits, signers, epochs } = testEnv;
        let epochDuration = await epochs.epochDuration();
        await token.transfer(signers.user.address, 10000);
        await token.connect(signers.user).approve(glmDeposits.address, 10000);

        for (var step of param.seq) {
          if (Number.isInteger(step)) {
            // positive integer is deposit
            if (step > 0) {
              await glmDeposits.connect(signers.user).deposit(step);
            }
            // negative - withdrawal
            if (step < 0) {
              await glmDeposits.connect(signers.user).withdraw(-step);
            }
          }
          if (Array.isArray(step)) {
            if (step[0] === "t") {
              // forward time
              await increaseNextBlockTimestamp(epochDuration * step[1]);
            }
          }
        }

        for (var index in param.test) {
          // test if at epochNo effective stake has particular value
          var epochNo = param.test[index][0];
          var value = param.test[index][1];
          expect(await glmDeposits.stakeAt(signers.user.address, epochNo)).eq(value);
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
    describe("Deployment", function() {
      it("No deposits in freshly deployed contract", async function() {
        const { glmDeposits, signers } = testEnv;
        expect(await glmDeposits.connect(signers.user).deposits(signers.user.address)).to.equal(0);
      });
      it("Can withdrawn", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.user.address, 1005);
        await token.connect(signers.user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.user).deposit(1000);
        await expect(await token.balanceOf(signers.user.address)).eq(5);
        await glmDeposits.connect(signers.user).withdraw(1000);
        await expect(await token.balanceOf(signers.user.address)).eq(1005);
      });
      it("Can't withdrawn empty", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await expect(glmDeposits.connect(signers.user).withdraw(1)).to.be.revertedWith("HN/deposit-is-smaller");
      });
      it("Can't withdrawn not owned", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.user.address, 1000);
        await token.connect(signers.user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.user).deposit(1000);
        await expect(glmDeposits.connect(signers.hacker).withdraw(1)).to.be.revertedWith("HN/deposit-is-smaller");
      });
      it("Can't withdrawn twice", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.hacker.address, 1000);
        await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.hacker).deposit(1000);
        await glmDeposits.connect(signers.hacker).withdraw(1000);
        let balance = await token.balanceOf(signers.hacker.address);
        await expect(glmDeposits.connect(signers.hacker).withdraw(1000)).to.be.revertedWith("HN/deposit-is-smaller");
        await expect(await token.balanceOf(signers.hacker.address)).eq(balance);
      });
      it("Can deposit again after withdrawal", async function() {
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
});
