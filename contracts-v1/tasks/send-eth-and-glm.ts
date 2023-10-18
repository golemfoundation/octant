import { parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { GLM_FAUCET_ADDRESS } from '../env';
import { FAUCET } from '../helpers/constants';
import { TestGLMFaucet } from '../typechain';

/* eslint no-console: 0 */

task('send-eth-and-glm', 'Send ETH and GLM to given addresses')
  .addParam('recipients', 'Recipient of GLMs, comma separated')
  .setAction(async (taskArgs, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const recipientsArray = taskArgs.recipients.split(',');
    const faucet: TestGLMFaucet = await ethers.getContractAt(FAUCET, GLM_FAUCET_ADDRESS, deployer);

    for (const recipient of recipientsArray) {
      // eslint-disable-next-line no-await-in-loop
      const ethTx = await deployer.sendTransaction({ to: recipient, value: parseEther('0.05') });
      console.log(`ETH sent to ${recipient}, tx hash: ${ethTx.hash}`);
      // eslint-disable-next-line no-await-in-loop
      const glmTx = await faucet.sendGLM(recipient);
      console.log(`GLM sent to ${recipient}, tx hash: ${glmTx.hash}`);
    }
  });
