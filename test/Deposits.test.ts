import { expect } from "chai";
import { DEPOSITS } from "../helpers/constants";
import { makeTestsEnv } from "./helpers/make-tests-env";

makeTestsEnv(DEPOSITS, (testEnv) => {

  describe("Deposits", async () => {
    it("No deposits in freshly deployed contract", async function () {
      const { glmDeposits, signers } = testEnv;
      expect(await glmDeposits.connect(signers.Alice).deposits(signers.Alice.address)).to.equal(0);
    });
    it("Can withdrawn", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).withdraw(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
    });
    it("Can't withdrawn empty", async function () {
      const { glmDeposits, signers } = testEnv;
      expect(glmDeposits.connect(signers.Alice).withdraw(1)).to.be.revertedWith(
        "HN/deposit-is-smaller"
      );
    });
    it("Can't withdrawn not owned", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(glmDeposits.connect(signers.Darth).withdraw(1)).to.be.revertedWith(
        "HN/deposit-is-smaller"
      );
    });
    it("Can't withdrawn twice", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
      await glmDeposits.connect(signers.Darth).withdraw(1000);
      let balance = await token.balanceOf(signers.Darth.address);
      expect(glmDeposits.connect(signers.Darth).withdraw(1000)).to.be.revertedWith(
        "HN/deposit-is-smaller"
      );
      expect(await token.balanceOf(signers.Darth.address)).eq(balance);
    });
    it("Can deposit again after withdrawal", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Darth.address, 1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
      await glmDeposits.connect(signers.Darth).withdraw(1000);
      await token.connect(signers.Darth).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Darth).deposit(1000);
    });
    it("Can increase deposit", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1005);
      expect(await token.balanceOf(signers.Alice.address)).eq(1005);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(await token.balanceOf(glmDeposits.address)).eq(1000);
      expect(await token.balanceOf(signers.Alice.address)).eq(5);
      await glmDeposits.connect(signers.Alice).deposit(5);
      expect(await token.balanceOf(glmDeposits.address)).eq(1005);
    });
    it("Can withdraw partially", async function () {
      const { token, glmDeposits, signers } = testEnv;
      await token.transfer(signers.Alice.address, 1000);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      await glmDeposits.connect(signers.Alice).withdraw(600);
      expect(await token.balanceOf(glmDeposits.address)).eq(400);
      expect(await token.balanceOf(signers.Alice.address)).eq(600);
    });
  });
});
