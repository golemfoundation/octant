import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { PROPOSAL_ADDRESSES, PROPOSALS_CID } from '../env';
import { EPOCHS, PROPOSALS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let proposalAddresses = PROPOSAL_ADDRESSES;

  /// for localhost and goerli same set of proposals is used
  /// for hardhat - test propsals are used
  if (hre.network.name === 'hardhat') {
    const unnamedAddresses = await hre.getUnnamedAccounts();
    proposalAddresses = unnamedAddresses.slice(0, 10);
  }

  const epochs = await ethers.getContract(EPOCHS);

  await deploy(PROPOSALS, {
    args: [epochs.address, PROPOSALS_CID, proposalAddresses],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['proposals', 'local', 'test', 'goerli'];
