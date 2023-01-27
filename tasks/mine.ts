import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';

task('mine', 'Mine given number of blocks')
  .addParam('quantity', 'Number of blocks to mine', 1, int)
  .setAction(async (taskArgs, { network }) => {
    await network.provider.send('hardhat_mine', [`0x${taskArgs.quantity.toString(16)}`]);
  });
