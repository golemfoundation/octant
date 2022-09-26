import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { solidity } from 'ethereum-waffle';

import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { PROPOSALS, DEPOSITS, TOKEN } from '../../helpers/constants';
import { Proposals, Deposits, Token } from '../../typechain-types';
import { Signers, TestEnv } from './test-env.interface';

chai.use(bignumberChai());
chai.use(solidity);


const testEnv: TestEnv = {
  signers: {} as Signers,
  esigners: [] as Array<Signer>,
  proposals: {} as Proposals,
  glmDeposits: {} as Deposits,
  token: {} as Token,
};

async function initializeTestsEnv() {
  testEnv.signers = await getNamedAccounts();
  testEnv.esigners = await ethers.getSigners();
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
  testEnv.proposals = await ethers.getContract(PROPOSALS);
}

export function makeTestsEnv(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    beforeEach(async () => {
      await deployments.fixture(['main']);
      await initializeTestsEnv();
    });
    tests(testEnv);
  });
}
