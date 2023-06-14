import { smock } from '@defi-wonderland/smock';
import chai from 'chai';
import { deployments, ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import { Signers, TestEnv } from './test-env.interface';

import {
  AUTH,
  DEPOSITS,
  EPOCHS,
  FAUCET,
  TOKEN,
  PROPOSALS,
  VAULT,
  WITHDRAWALS_TARGET,
} from '../../helpers/constants';
import {
  Auth,
  Deposits,
  Epochs,
  TestGLMFaucet,
  Token,
  Proposals,
  Vault,
  WithdrawalsTarget,
} from '../../typechain';

chai.use(smock.matchers);

const testEnv: TestEnv = {
  auth: {} as Auth,
  epochs: {} as Epochs,
  faucet: {} as TestGLMFaucet,
  glmDeposits: {} as Deposits,
  proposalAddresses: {} as SignerWithAddress[],
  proposals: {} as Proposals,
  signers: {} as Signers,
  target: {} as WithdrawalsTarget,
  token: {} as Token,
  vault: {} as Vault,
};

async function initializeTestsEnv() {
  testEnv.proposalAddresses = await ethers
    .getUnnamedSigners()
    .then(proposals => proposals.slice(0, 12));
  testEnv.auth = await ethers.getContract(AUTH);
  testEnv.epochs = await ethers.getContract(EPOCHS);
  testEnv.faucet = await ethers.getContract(FAUCET);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
  testEnv.proposals = await ethers.getContract(PROPOSALS);
  testEnv.signers = await ethers.getNamedSigners();
  testEnv.target = await ethers.getContract(WITHDRAWALS_TARGET);
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.vault = await ethers.getContract(VAULT);
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
