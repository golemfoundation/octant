import { parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { DEPOSITS, TOKEN } from '../helpers/constants';
import { Deposits, ERC20 } from '../typechain';

/* eslint no-console: 0 */

task('prepare-local-test-env', 'Prepare local test environment')
  .setDescription(
    `
      Use this to run a local environment.
      Console steps look like this:
        |    1. yarn start-node # this does not deploy contracts
        |    2. yarn deploy:localhost # will deploy to localhost network
        |    3. yarn prepare-local-test-env # will perform basic setup of localhost network
        |  Please note that step will populate proposals with test values.`,
  )
  .setAction(async (_, { ethers }) => {
    const { Alice } = await ethers.getNamedSigners();
    const token: ERC20 = await ethers.getContract(TOKEN);
    const glmDeposits: Deposits = await ethers.getContract(DEPOSITS);
    // eslint-disable-next-line no-console
    console.log('Alice is making GLM deposit.');
    const glmLock = parseEther('1000000');
    await token.transfer(Alice.address, glmLock);
    await token.connect(Alice).approve(glmDeposits.address, glmLock);
    await glmDeposits.connect(Alice).lock(glmLock);
    // eslint-disable-next-line no-console
    console.log("Alice's address is ", Alice.address);
    // eslint-disable-next-line no-console
    console.log(
      "To retrieve Alice's private key and to add her to Metamask, please check `yarn start-node` output for her private key or use default mnemonic mentioned in the README.",
    );
    console.log('Test environment prepared.');
  });
