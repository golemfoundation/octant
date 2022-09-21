import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DEPOSITS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(DEPOSITS, (testEnv) => {

		describe("Deposits", async () => {
				describe("Deployment", function () {
						it("No deposits in freshly deployed contract", async function () {
								const { glmd, esigners } = testEnv;
								let user = esigners[1];
								expect(await glmd.connect(user).stakes_since(user.address)).to.equal(0);
						});
						it("Can deposit, can't deposit again", async function () {
								const { token, glmd, esigners } = testEnv;
								let user = esigners[1];
								await token.transfer(user.address, 1005);
								await token.connect(user).approve(glmd.address, 1000);
								await expect(await token.balanceOf(user.address)).eq(1005);
								await glmd.connect(user).deposit(1000);
								await expect(await token.balanceOf(glmd.address)).eq(1000);
								await expect(await token.balanceOf(user.address)).eq(5);
								await expect(glmd.connect(user).deposit(5)).to.be.revertedWith("HN/deposit-already-exists");
						});
					it("Can withdrawn", async function () {
						const { token, glmd, esigners } = testEnv;
						let user = esigners[1];
						await token.transfer(user.address, 1005);
						await token.connect(user).approve(glmd.address, 1000);
						await glmd.connect(user).deposit(1000);
						await expect(await token.balanceOf(user.address)).eq(5);
						await glmd.connect(user).withdraw();
						await expect(await token.balanceOf(user.address)).eq(1005);
					});
					it("Can't withdrawn empty", async function () {
						const { token, glmd, esigners } = testEnv;
						let user = esigners[1];
						await expect(glmd.connect(user).withdraw()).to.be.revertedWith("HN/no-such-deposit");
					});
					it("Can't withdrawn not owned", async function () {
						const { token, glmd, esigners } = testEnv;
						let user = esigners[1];
						let hacker = esigners[2];
						await token.transfer(user.address, 1000);
						await token.connect(user).approve(glmd.address, 1000);
						await glmd.connect(user).deposit(1000);
						await expect(glmd.connect(hacker).withdraw()).to.be.revertedWith("HN/no-such-deposit");
					});
					it("Can't withdrawn twice", async function () {
						const { token, glmd, esigners } = testEnv;
						let hacker = esigners[1];
						await token.transfer(hacker.address, 1000);
						await token.connect(hacker).approve(glmd.address, 1000);
						await glmd.connect(hacker).deposit(1000);
						await glmd.connect(hacker).withdraw();
						let balance = await token.balanceOf(hacker.address);
						await expect(glmd.connect(hacker).withdraw()).to.be.revertedWith("HN/already-withdrawn");
						await expect(await token.balanceOf(hacker.address)).eq(balance);
					});
					it("Can deposit again after withdrawal", async function () {
						const { token, glmd, esigners } = testEnv;
						let hacker = esigners[1];
						await token.transfer(hacker.address, 1000);
						await token.connect(hacker).approve(glmd.address, 1000);
						await glmd.connect(hacker).deposit(1000);
						await glmd.connect(hacker).withdraw();
						await token.connect(hacker).approve(glmd.address, 1000);
						await glmd.connect(hacker).deposit(1000);
					});
				});
		});
});
