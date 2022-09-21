import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { solidity } from 'ethereum-waffle';

import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { PROPOSALS } from '../../helpers/constants';
import { Proposals } from '../../typechain-types';
import { Signers, TestEnv } from './test-env.interface';

chai.use(bignumberChai());
chai.use(solidity);


const testEnv: TestEnv = {
  signers: {} as Signers,
  proposals: {} as Proposals,
};

async function initializeTestsEnv() {
  testEnv.signers = await getNamedAccounts();
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
