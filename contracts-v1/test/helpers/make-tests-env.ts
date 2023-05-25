import { smock } from '@defi-wonderland/smock';
import chai from 'chai';
import { deployments, ethers } from 'hardhat';

import { Signers, TestEnv } from './test-env.interface';

import { AUTH, DEPOSITS, EPOCHS, FAUCET, TOKEN, WITHDRAWALS_TARGET } from '../../helpers/constants';
import { Auth, Deposits, Epochs, TestGLMFaucet, Token, WithdrawalsTarget } from '../../typechain';

chai.use(smock.matchers);

const testEnv: TestEnv = {
  auth: {} as Auth,
  epochs: {} as Epochs,
  faucet: {} as TestGLMFaucet,
  glmDeposits: {} as Deposits,
  signers: {} as Signers,
  target: {} as WithdrawalsTarget,
  token: {} as Token,
};

async function initializeTestsEnv() {
  testEnv.signers = await ethers.getNamedSigners();
  testEnv.auth = await ethers.getContract(AUTH);
  testEnv.epochs = await ethers.getContract(EPOCHS);
  testEnv.faucet = await ethers.getContract(FAUCET);
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.target = await ethers.getContract(WITHDRAWALS_TARGET);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
}

export function makeTestsEnv(name: string, tests: (testEnvToMake: TestEnv) => void): void {
  describe(name, () => {
    beforeEach(async () => {
      await deployments.fixture(['test']);
      await initializeTestsEnv();
    });
    tests(testEnv);
  });
}
