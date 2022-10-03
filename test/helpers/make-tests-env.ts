import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { solidity } from 'ethereum-waffle';

import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { PROPOSALS, DEPOSITS, TOKEN, ALLOCATIONS } from '../../helpers/constants';
import { Proposals, Deposits, Token, Allocations } from '../../typechain-types';
import { Signers, TestEnv } from './test-env.interface';

chai.use(bignumberChai());
chai.use(solidity);


const testEnv: TestEnv = {
  signers: {} as Signers,
  allocations: {} as Allocations,
  proposals: {} as Proposals,
  glmDeposits: {} as Deposits,
  token: {} as Token,
};

async function initializeTestsEnv() {
  testEnv.signers = await ethers.getNamedSigners();
  testEnv.allocations = await ethers.getContract(ALLOCATIONS);
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
  testEnv.proposals = await ethers.getContract(PROPOSALS);
}

export function makeTestsEnv(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    beforeEach(async () => {
      await deployments.fixture(['test']);
      await initializeTestsEnv();
    });
    tests(testEnv);
  });
}
