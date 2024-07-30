import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH_ADDRESS, PROPOSALS_ADDRESSES, PROPOSALS_CID } from '../env';
import { AUTH, PROPOSALS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const authAddress = AUTH_ADDRESS || (await hre.deployments.get(AUTH)).address;

  let proposalAddresses = PROPOSALS_ADDRESSES.split(',');
  for (const item of proposalAddresses) {
    /* eslint-disable no-console */
    console.log('proposal address: ', item);
  }

  /// for localhost and testnet same set of proposals is used
  /// for hardhat - test proposals are used
  if (hre.network.name === 'hardhat') {
    const unnamedAddresses = await hre.getUnnamedAccounts();
    proposalAddresses = unnamedAddresses.slice(0, 10);
  }

  await deploy(PROPOSALS, {
    args: [PROPOSALS_CID, proposalAddresses, authAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epoch1', 'proposals', 'local', 'test', 'testnet'];
