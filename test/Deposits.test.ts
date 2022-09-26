import { expect } from "chai";
import { DEPOSITS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe("Deposits", async () => {
    describe("Deployment", function() {
      it("No deposits in freshly deployed contract", async function() {
        const { glmDeposits, esigners } = testEnv;
        let user = esigners[1];
        expect(await glmDeposits.connect(user).stakesSince(user.address)).to.equal(0);
      });
      it("Can deposit, can't deposit again", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let user = esigners[1];
        await token.transfer(user.address, 1005);
        await token.connect(user).approve(glmDeposits.address, 1000);
        await expect(await token.balanceOf(user.address)).eq(1005);
        await glmDeposits.connect(user).deposit(1000);
        await expect(await token.balanceOf(glmDeposits.address)).eq(1000);
        await expect(await token.balanceOf(user.address)).eq(5);
        await expect(glmDeposits.connect(user).deposit(5)).to.be.revertedWith("HN/deposit-already-exists");
      });
      it("Can withdrawn", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let user = esigners[1];
        await token.transfer(user.address, 1005);
        await token.connect(user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(user).deposit(1000);
        await expect(await token.balanceOf(user.address)).eq(5);
        await glmDeposits.connect(user).withdraw();
        await expect(await token.balanceOf(user.address)).eq(1005);
      });
      it("Can't withdrawn empty", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let user = esigners[1];
        await expect(glmDeposits.connect(user).withdraw()).to.be.revertedWith("HN/no-such-deposit");
      });
      it("Can't withdrawn not owned", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let user = esigners[1];
        let hacker = esigners[2];
        await token.transfer(user.address, 1000);
        await token.connect(user).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(user).deposit(1000);
        await expect(glmDeposits.connect(hacker).withdraw()).to.be.revertedWith("HN/no-such-deposit");
      });
      it("Can't withdrawn twice", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let hacker = esigners[1];
        await token.transfer(hacker.address, 1000);
        await token.connect(hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(hacker).deposit(1000);
        await glmDeposits.connect(hacker).withdraw();
        let balance = await token.balanceOf(hacker.address);
        await expect(glmDeposits.connect(hacker).withdraw()).to.be.revertedWith("HN/already-withdrawn");
        await expect(await token.balanceOf(hacker.address)).eq(balance);
      });
      it("Can deposit again after withdrawal", async function() {
        const { token, glmDeposits, esigners } = testEnv;
        let hacker = esigners[1];
        await token.transfer(hacker.address, 1000);
        await token.connect(hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(hacker).deposit(1000);
        await glmDeposits.connect(hacker).withdraw();
        await token.connect(hacker).approve(glmDeposits.address, 1000);
        await glmDeposits.connect(hacker).deposit(1000);
      });
    });
  });
});
