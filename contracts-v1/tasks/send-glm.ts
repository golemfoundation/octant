import { task } from 'hardhat/config';

import { GLM_FAUCET_ADDRESS } from '../env';
import { FAUCET } from '../helpers/constants';
import { TestGLMFaucet } from '../typechain';

task('send-glm', 'Send Test GLM to given address')
  .addParam('recipient', 'Recipient of GLMs')
  .setAction(async (taskArgs, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const faucet: TestGLMFaucet = await ethers.getContractAt(FAUCET, GLM_FAUCET_ADDRESS, deployer);
    const tx = await faucet.sendGLM(taskArgs.recipient);
    // eslint-disable-next-line no-console
    console.log(`GLMs sent to ${taskArgs.recipient}, tx hash: ${tx.hash}`);
  });
