import { parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { OCTANT_ORACLE } from '../helpers/constants';
import { Epochs, OctantOracle, WithdrawalsTargetV3 } from '../typechain-types';

/* eslint no-console: 0 */

task('target-fund', 'Send some funds to WithdrawalsTarget, simulating ETH staking rewards')
  .addParam('address', 'Address of the proxy', '0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1')
  .addParam('amount', 'Amount in ethers', '1.0')
  .setAction(async (taskArgs, { ethers, getNamedAccounts, network }) => {
    if (network.name !== 'localhost') {
      console.log('This script will work only with localhost network');
      return;
    }
    const { deployer } = await getNamedAccounts();
    const octantOracle: OctantOracle = await ethers.getContract(OCTANT_ORACLE);
    const epochs: Epochs = await ethers.getContract('Epochs');
    const target: WithdrawalsTargetV3 = await ethers.getContractAt(
      'WithdrawalsTargetV3',
      taskArgs.address,
      deployer,
    );
    await target.sendETH({ value: parseEther(taskArgs.amount) });

    const epochDuration = await epochs.getEpochDuration();
    const nextTimestamp = epochDuration.toNumber();
    await network.provider.send('evm_increaseTime', [nextTimestamp]);
    await network.provider.send('evm_mine');

    await octantOracle.writeBalance();
  });
