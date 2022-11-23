import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { TRACKER } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { makeTestsEnv } from './helpers/make-tests-env';

interface Step {
  Alice?: number;
  Bob?: number;
  Charlie?: number;
  forwardEpochs?: number;
}

interface Test {
  epoch: number;
  expDAlice?: number;
  expDBob?: number;
  expDCharlie?: number;
  expDTotal?: number;
}

interface TestParam {
  steps: Step[];
  tests: Test[];
  desc: String;
}

makeTestsEnv(TRACKER, (testEnv) => {

  describe("Effective deposits, total", async () => {
    it("totalDepositAt summs for simple cases", async () => {
      const { token, glmDeposits, epochs, signers, tracker } = testEnv;
      const participants = [signers.Alice, signers.Bob];
      for (let i = 0; i < participants.length; i++) {
        await token.transfer(participants[i].address, parseEther("1000"));
        await token.connect(participants[i]).approve(glmDeposits.address, parseEther("1000"));
        await glmDeposits.connect(participants[i]).deposit(parseEther("1000"));
      }
      expect(await tracker.totalDeposit()).eq(parseEther("2000"));
      expect(await tracker.totalDepositAt(1)).eq(parseEther("0"));
      await forwardEpochs(epochs, 1);
      expect(await tracker.totalDepositAt(2)).eq(parseEther("2000"));
    });
  });

  describe("Test config sanity check", async () => {
    it("signers are distinct", async () => {
      const { signers } = testEnv;
      let configured = new Set();
        for (let name of ["Alice", "Bob", "Charlie"]) {
        configured.add(signers[name].address);
      }
      expect(configured.size).eq(3);
    });
  });

  describe("Effective deposits", async () => {

    let toWei = function (n: number): BigNumber {
      return parseEther(Math.abs(n).toString());
    }

    const parameters: TestParam[] = [
      {
        steps: [{ Alice: 1000, forwardEpochs: 10 }, { Alice: -1000 }],
        tests: [{ epoch: 2, expDAlice: 1000 }],
        desc: "check ED in a long period between deposit and withdrawal",
      },
      {
        steps: [{ Alice: 1000, forwardEpochs: 100 }, { Alice: -1000 }],
        tests: [{ epoch: 5, expDAlice: 1000 }],
        desc: "Check ED in a very long period between deposit and withdrawal",
      },
      {
        steps: [
          { Alice: 1000, forwardEpochs: 1 },
          { Alice: -1000, forwardEpochs: 2 },
        ],
        tests: [{ epoch: 2, expDAlice: 0 }],
        desc: "ED sits at zero after user removed all funds",
      },
      {
        steps: [],
        tests: [{ epoch: 1, expDAlice: 0 }],
        desc: "Uninitialized deposit means that ED is at zero",
      },
      {
        steps: [{ forwardEpochs: 20 }, { Alice: 1000 }],
        tests: [{ epoch: 1, expDAlice: 0 }],
        desc: "Before first deposit ED is at zero",
      },
      {
        steps: [
          { Alice: 1000, forwardEpochs: 1 },
          { Alice: 100, forwardEpochs: 3 },
        ],
        tests: [
          { epoch: 2, expDAlice: 1000 },
          { epoch: 4, expDAlice: 1100 },
        ],
        desc: "ED is at lowest value during the epoch; in fresh epoch ED is at deposit level",
      },
      {
        steps: [{ Alice: 1000, forwardEpochs: 5 }],
        tests: [{ epoch: 2, expDAlice: 1000 }],
        desc: "After a deposit, ED stays at deposit level even if no further events occur",
      },
      {
        steps: [{ Alice: 1000, forwardEpochs: 5 }, { Alice: -100 }, { Alice: -100 }, { Alice: -100 }, { forwardEpochs: 5 }],
        tests: [{ epoch: 2, expDAlice: 1000 }, { epoch: 5, expDAlice: 1000 }, { epoch: 6, expDAlice: 700 }],
        desc: "Multiple withdrawals reduce ED",
      },
      {
        steps: [{ Alice: 50, forwardEpochs: 1 }, { Alice: 100, forwardEpochs: 2 }, { Alice: -99, forwardEpochs: 2 }],
        tests: [{ epoch: 1, expDAlice: 0 }, { epoch: 3, expDAlice: 150 }, { epoch: 4, expDAlice: 0 }],
        desc: "ED is at lowest value during the epoch, 100 GLM capped",
      },
      {
        steps: [{ Alice: 1000, forwardEpochs: 1 }, { Alice: -500 }, { Alice: -300 }],
        tests: [{ epoch: 2, expDAlice: 200 }],
        desc: "ED is at lowest value during the epoch, no capping",
      },
      {
        steps: [{ Alice: 1000, Bob: 1000, forwardEpochs: 1 }],
        tests: [{ epoch: 2, expDTotal: 2000 }],
        desc: "TED takes multiple user EDs into account",
      },
      {
        steps: [{ Alice: 1000, Bob: 1000, Charlie: 50, forwardEpochs: 1 }],
        tests: [{ epoch: 2, expDTotal: 2000 }],
        desc: "TED cutoff: multiple sources with cutoff on individual source level",
      },
      {
        steps: [{ Alice: 60, forwardEpochs: 1 }, { Alice: 60, forwardEpochs: 2 }, { Alice: -100, forwardEpochs: 2 }],
        tests: [{ epoch: 2, expDAlice: 0 }, { epoch: 3, expDAlice: 120 }, { epoch: 5, expDTotal: 0 }],
        desc: "ED: withdrawal does not affect past epochs",
      },
      {
        steps: [{ Alice: 60, forwardEpochs: 1 }, { Alice: 60, forwardEpochs: 2 }, { Alice: -100, forwardEpochs: 2 }],
        tests: [{ epoch: 2, expDTotal: 0 }, { epoch: 3, expDTotal: 120 }, { epoch: 5, expDTotal: 0 }],
        desc: "TED cutoff: cutoff boundary is crossed correctly",
      },
    ];
    parameters.forEach((param) => {
      it(`${param.desc}`, async () => {
        const { token, glmDeposits, signers, epochs, tracker } = testEnv;
        let currentEpoch = await epochs.getCurrentEpoch();
        expect(currentEpoch, "fresh test always starts from epoch one").eq(1);
         for (let userName of ["Alice", "Bob", "Charlie"]) {
          await token.transfer(signers[userName].address, parseEther("10000"));
          await token.connect(signers[userName]).approve(glmDeposits.address, parseEther("10000"));
        }

        for (let i = 0; i < param.steps.length; i++) {
          let step = param.steps[i];
           for (let userName of ['Alice', 'Bob', 'Charlie']) {
            if (step[userName] !== undefined) {
              if (step[userName] > 0) {
                await glmDeposits.connect(signers[userName]).deposit(toWei(step[userName]));
              }
              if (step[userName] < 0) {
                await glmDeposits.connect(signers[userName]).withdraw(toWei(step[userName]));
              }
            }
          }
          if (step.forwardEpochs) {
            await forwardEpochs(epochs, step.forwardEpochs);
          }
        }

        function nameToExp(name: string) {
          return "exp" + name[0].toUpperCase() + name.substring(1);
        }

        for (let probeId = 0; probeId < param.tests.length; probeId++) {
          // test if at epochNo effective deposit has particular value
          let probe = param.tests[probeId];
          for (let userName of ["Alice", "Bob", "Charlie"]) {
            let signer = signers[userName];
            let exp = nameToExp(userName);
            if (probe[exp]) {
              let expD = parseEther(probe[exp].toString());
              let promise = await tracker.depositAt(signer.address, probe.epoch);
              expect(promise, `ED ${exp} at epoch ${probe.epoch} should be equal to ${expD}`).eq(expD);
            }
          }
          if (probe.expDTotal) {
            let expD = parseEther(probe.expDTotal.toString());
            let promise = await tracker.totalDepositAt(probe.epoch);
            expect(promise, `TED at epoch ${probe.epoch} should be equal to ${expD}`).eq(expD);
          }
        }
      });
    });
  });

  describe("GLM supply is being tracked", async () => {
    it("tokenSupplyAt when forwarding", async () => {
      const { epochs, tracker } = testEnv;
      await forwardEpochs(epochs, 10);
      expect(await tracker.tokenSupplyAt(5)).gt(0);
    });
    it("tokenSupplyAt works for zero case", async () => {
      const { tracker } = testEnv;
      expect(await tracker.tokenSupplyAt(1)).gt(0);
    });
    it("tokenSupplyAt can't peek into the future", async () => {
      const { token, glmDeposits, signers, tracker } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(tracker.tokenSupplyAt(10)).to.be.revertedWith(
        "HN/future-is-unknown"
      );
    });
    it("Can read value in 'silent' epochs", async () => {
      const { epochs, token, glmDeposits, signers, tracker } = testEnv;
      let startAt = await epochs.start();
      console.log(`first epoch starts at ${startAt}`);
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(await epochs.getCurrentEpoch(), "first epoch number").eq(1);
      await forwardEpochs(epochs, 10);
      expect(await epochs.getCurrentEpoch(), "eleventh number number").eq(11);
      await tracker.tokenSupplyAt(4);
    });
  });

  describe("Effective deposits, edge cases", async () => {
    it("depositAt can't peek into the future", async () => {
      const { token, glmDeposits, signers, tracker } = testEnv;
      await token.transfer(signers.Alice.address, 1005);
      await token.connect(signers.Alice).approve(glmDeposits.address, 1000);
      await glmDeposits.connect(signers.Alice).deposit(1000);
      expect(tracker.depositAt(signers.Alice.address, 10)).to.be.revertedWith(
        "HN/future-is-unknown"
      );
    });
    it("tracker accepts calls only from deposits", async () => {
      const { signers, tracker } = testEnv;
      expect(tracker.connect(signers.Darth).processDeposit(signers.Darth.address, 0, parseEther("100000"))).to.be.revertedWith(
        "HN/invalid-caller"
      );
      expect(tracker.connect(signers.Darth).processWithdraw(signers.Darth.address, 0, parseEther("100000"))).to.be.revertedWith(
        "HN/invalid-caller"
      );
    });
  });
});
