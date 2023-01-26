import { parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import {
  ALLOCATIONS,
  BEACON_CHAIN_ORACLE,
  DEPOSITS,
  EPOCHS,
  EXECUTION_LAYER_ORACLE,
  TOKEN
} from '../helpers/constants';
import {
  Allocations,
  BeaconChainOracle,
  Deposits,
  Epochs,
  ERC20,
  ExecutionLayerOracle
} from '../typechain-types';

task('prepare-local-test-env', 'Prepare local test environment')
  .setAction(
    async (_, { ethers, network }) => {
      const { Alice } = await ethers.getNamedSigners();
      const allocations: Allocations = await ethers.getContract(ALLOCATIONS);
      const token: ERC20 = await ethers.getContract(TOKEN);
      const glmDeposits: Deposits = await ethers.getContract(DEPOSITS);
      const epochs: Epochs = await ethers.getContract(EPOCHS);
      const epochDuration = await epochs.epochDuration();
      console.log(`Epoch duraiton: ${epochDuration}.`);
      const beaconChainOracle: BeaconChainOracle = await ethers.getContract(BEACON_CHAIN_ORACLE);
      const executionLayerOracle: ExecutionLayerOracle = await ethers.getContract(EXECUTION_LAYER_ORACLE);
      console.log('Making deposit.');
      await token.transfer(Alice.address, parseEther('1000000'));
      await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
      await glmDeposits.connect(Alice).deposit(parseEther('1000000'));
      console.log('Setting up Oracle balances.');
      await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
      await network.provider.send('evm_mine');
      await beaconChainOracle.setBalance(1, parseEther('200'));
      await executionLayerOracle.setBalance(1, parseEther('200'));
      await network.provider.send('evm_increaseTime', [epochDuration.toNumber()]);
      await network.provider.send('evm_mine');
      await beaconChainOracle.setBalance(2, parseEther('400'));
      await executionLayerOracle.setBalance(2, parseEther('400'));
      console.log("Alice is allocating to first proposal.")
      const userAllocations = [{ proposalId: 1, allocation: parseEther('0.4') }];
      await allocations.connect(Alice).allocate(userAllocations);
      console.log('Test environment prepared.');
    }
  );
