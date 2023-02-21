import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { PROPOSAL_ADDRESSES, PROPOSALS_CID } from '../env';
import { PROPOSALS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let proposalAddresses = PROPOSAL_ADDRESSES;

  if (hre.network.name === 'hardhat') {
    const unnamedAddresses = await hre.getUnnamedAccounts();
    proposalAddresses = unnamedAddresses.slice(0, 10);
  }

  await deploy(PROPOSALS, {
    args: [PROPOSALS_CID, proposalAddresses],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['proposals', 'local', 'test', 'goerli'];
