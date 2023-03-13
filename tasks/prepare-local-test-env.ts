import { parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { ALLOCATIONS, DEPOSITS, EPOCHS, OCTANT_ORACLE, TOKEN } from '../helpers/constants';
import {
  Allocations,
  Deposits,
  ERC20,
  Epochs,
  OctantOracle,
  WithdrawalsTargetV3,
} from '../typechain-types';

task('prepare-local-test-env', 'Prepare local test environment')
  .setDescription(
    `

   Use this to run a local environment.
    Console steps look like this:
     1. hh node --no-deploy
     2. hh --localhost deploy
     3. hh --localhost prepare-local-test-env

    Please note that deploying contracts in hh deploy step will populate proposals with test values.`,
  )
  .setAction(async (_, { ethers, network, deployments }) => {
    const { deploy } = deployments;
    const { deployer, Alice } = await ethers.getNamedSigners();
    const proposalAddresses = await ethers.getUnnamedSigners();
    const allocations: Allocations = await ethers.getContract(ALLOCATIONS);
    const token: ERC20 = await ethers.getContract(TOKEN);
    const glmDeposits: Deposits = await ethers.getContract(DEPOSITS);
    const epochs: Epochs = await ethers.getContract(EPOCHS);
    const epochDuration = await epochs.getEpochDuration();
    // eslint-disable-next-line no-console
    console.log(`Epoch duraiton: ${epochDuration}.`);
    const octantOracle: OctantOracle = await ethers.getContract(OCTANT_ORACLE);
    const t = await deploy('WithdrawalsTarget', {
      contract: 'WithdrawalsTargetV3',
      from: deployer.address,
      proxy: true,
    });
    const target: WithdrawalsTargetV3 = await ethers.getContractAt(
      'WithdrawalsTargetV3',
      t.address,
    );
    // eslint-disable-next-line no-console
    console.log('Making deposit.');
    await token.transfer(Alice.address, parseEther('1000000'));
    await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
    await glmDeposits.connect(Alice).lock(parseEther('1000000'));
    // eslint-disable-next-line no-console
    console.log('Setting up Oracle balances.');
    await target.sendETH({ value: parseEther('400') });
    await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
    await network.provider.send('evm_mine');
    await octantOracle.writeBalance();
    await target.sendETH({ value: parseEther('400') });
    await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
    await network.provider.send('evm_mine');
    await octantOracle.writeBalance();
    // eslint-disable-next-line no-console
    console.log('Alice is allocating to first proposal.');
    const userAllocations = [
      { allocation: parseEther('0.4'), proposal: proposalAddresses[0].address },
    ];
    await allocations.connect(Alice).allocate(userAllocations);
    // eslint-disable-next-line no-console
    console.log('Test environment prepared.');
  });
