import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';

task('increase-time', 'Increase next block time')
  .addParam('time', 'time in sec', 10, int)
  .setAction(async (taskArgs, { network }) => {
    await network.provider.send('evm_increaseTime', [taskArgs.time]);
    await network.provider.send('evm_mine');
  });
