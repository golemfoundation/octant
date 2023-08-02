import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';

/* eslint no-console: 0 */

task('increase-time', 'Increase next block time')
  .addParam('time', 'time in sec', 300, int)
  .setAction(async (taskArgs, { network }) => {
    if (network.name !== 'localhost') {
      console.log('This script will work only with localhost network');
      return;
    }
    console.log(`Forwarding chain time ${taskArgs.time}s`);
    await network.provider.send('evm_increaseTime', [taskArgs.time]);
    await network.provider.send('evm_mine');
  });
