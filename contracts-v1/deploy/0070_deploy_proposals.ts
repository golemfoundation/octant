import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH_ADDRESS, PROPOSALS_CID } from '../env';
import { AUTH, PROPOSALS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const authAddress = AUTH_ADDRESS || (await ethers.getContract(AUTH)).address;

  await deploy(PROPOSALS, {
    args: [PROPOSALS_CID, [], authAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epoch1', 'proposals', 'local', 'test', 'testnet'];
