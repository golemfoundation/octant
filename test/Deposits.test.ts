import { expect } from "chai";
import { DEPOSITS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe("Deposits", async () => {
    describe("Deployment", function() {
      it("No deposits in freshly deployed contract", async function() {
        const { glmDeposits, signers } = testEnv;
        expect(await glmDeposits.connect(signers.user).stakesSince(signers.user.address)).to.equal(0);
      });
      it("Can deposit, can't deposit again", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.user.address, 1005);
        await token.connect(signers.user).approve(glmDeposits.address, 1000);
        await expect(await token.balanceOf(signers.user.address)).eq(1005);
        await glmDeposits.connect(signers.user).deposit(1000);
        await expect(await token.balanceOf(glmDeposits.address)).eq(1000);
        await expect(await token.balanceOf(signers.user.address)).eq(5);
        await expect(glmDeposits.connect(signers.user).deposit(5)).to.be.revertedWith("HN/deposit-already-exists");
      });
      it("Can withdrawn", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.user.address, 1005);
        await token.connect(signers.user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.user).deposit(1000);
        await expect(await token.balanceOf(signers.user.address)).eq(5);
        await glmDeposits.connect(signers.user).withdraw();
        await expect(await token.balanceOf(signers.user.address)).eq(1005);
      });
      it("Can't withdrawn empty", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await expect(glmDeposits.connect(signers.user).withdraw()).to.be.revertedWith("HN/no-such-deposit");
      });
      it("Can't withdrawn not owned", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.user.address, 1000);
        await token.connect(signers.user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.user).deposit(1000);
        await expect(glmDeposits.connect(signers.hacker).withdraw()).to.be.revertedWith("HN/no-such-deposit");
      });
      it("Can't withdrawn twice", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.hacker.address, 1000);
        await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.hacker).deposit(1000);
        await glmDeposits.connect(signers.hacker).withdraw();
        let balance = await token.balanceOf(signers.hacker.address);
        await expect(glmDeposits.connect(signers.hacker).withdraw()).to.be.revertedWith("HN/already-withdrawn");
        await expect(await token.balanceOf(signers.hacker.address)).eq(balance);
      });
      it("Can deposit again after withdrawal", async function() {
        const { token, glmDeposits, signers } = testEnv;
        await token.transfer(signers.hacker.address, 1000);
        await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.hacker).deposit(1000);
        await glmDeposits.connect(signers.hacker).withdraw();
        await token.connect(signers.hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(signers.hacker).deposit(1000);
      });
    });
  });
});
