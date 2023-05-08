import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';

import { EPOCH_DURATION } from '../env';

/* eslint no-console: 0 */

task('increase-time', 'Increase next block time')
  .addParam('time', 'time in sec', EPOCH_DURATION, int)
  .setAction(async (taskArgs, { network }) => {
    if (network.name !== 'localhost') {
      console.log('This script will work only with localhost network');
      return;
    }

    await network.provider.send('evm_increaseTime', [taskArgs.time]);
    await network.provider.send('evm_mine');
  });
