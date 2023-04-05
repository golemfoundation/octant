import { formatEther, parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import {
  ALLOCATIONS,
  DEPOSITS,
  EPOCHS,
  OCTANT_ORACLE,
  TOKEN,
  WITHDRAWALS_TARGET,
} from '../helpers/constants';
import {
  Allocations,
  Deposits,
  ERC20,
  Epochs,
  OctantOracle,
  WithdrawalsTarget,
} from '../typechain';

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
  .setAction(async (_, { ethers, network }) => {
    const { deployer, Alice } = await ethers.getNamedSigners();
    const proposalAddresses = await ethers.getUnnamedSigners();
    const allocations: Allocations = await ethers.getContract(ALLOCATIONS);
    const token: ERC20 = await ethers.getContract(TOKEN);
    const glmDeposits: Deposits = await ethers.getContract(DEPOSITS);
    const epochs: Epochs = await ethers.getContract(EPOCHS);
    const epochDuration = await epochs.getEpochDuration();
    // eslint-disable-next-line no-console
    console.log(`Epoch duration: ${epochDuration}.`);
    const octantOracle: OctantOracle = await ethers.getContract(OCTANT_ORACLE);
    const target: WithdrawalsTarget = await ethers.getContract(WITHDRAWALS_TARGET);
    // eslint-disable-next-line no-console
    console.log('Alice is making GLM deposit.');
    const glmLock = parseEther('1000000');
    await token.transfer(Alice.address, glmLock);
    await token.connect(Alice).approve(glmDeposits.address, glmLock);
    await glmDeposits.connect(Alice).lock(glmLock);
    // eslint-disable-next-line no-console
    console.log('Setting up Oracle balances.');
    // eslint-disable-next-line no-console
    console.log("Alice's address is ", Alice.address);
    // eslint-disable-next-line no-console
    console.log(
      "To retrieve Alice's private key and to add her to Metamask, please check `yarn start-node` output for her private key or use default mnemonic mentioned in the README.",
    );
    await deployer.sendTransaction({
      to: target.address,
      value: ethers.utils.parseEther('400'),
    });
    await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
    await network.provider.send('evm_mine');
    await octantOracle.writeBalance();
    await deployer.sendTransaction({
      to: target.address,
      value: ethers.utils.parseEther('400'),
    });
    await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
    await network.provider.send('evm_mine');
    await octantOracle.writeBalance();
    const ethAmount = parseEther('0.4');
    // eslint-disable-next-line no-console
    console.log(
      `Alice is allocating ${formatEther(ethAmount)} ETH to first proposal:`,
      proposalAddresses[0],
    );
    const userAllocations = [{ allocation: ethAmount, proposal: proposalAddresses[0].address }];
    await allocations.connect(Alice).allocate(userAllocations);
    // eslint-disable-next-line no-console
    console.log('Test environment prepared.');
  });
