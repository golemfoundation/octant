import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, TEST_REWARDS } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { Allocations, AllocationsStorage } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

let zeroAddr = '0x0000000000000000000000000000000000000000';

makeTestsEnv(TEST_REWARDS, (testEnv) => {

  it('returns individual rewards for a user', async () => {
    const { testRewards, signers } = testEnv;
    expect(await testRewards.individualReward(1, signers.Alice.address)).eq(parseEther('0.4'));
  });

  it('allows to allocate rewards from a user and calculate matched rewards', async () => {
    const { epochs, proposals, tracker, signers: { Alice } } = testEnv;

    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
    const testRewardsFactory = await ethers.getContractFactory(TEST_REWARDS);
    const testRewards = await testRewardsFactory.deploy(epochs.address, zeroAddr, tracker.address, zeroAddr, proposals.address, allocationsStorage.address);
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);
    const allocations: Allocations = await allocationsFactory.deploy(epochs.address, allocationsStorage.address, testRewards.address) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    await forwardEpochs(epochs, 1);
    await allocations.connect(Alice).allocate(1, parseEther('0.2'));
    const result = await testRewards.matchedProposalRewards(1);
    expect(result[0].donated).eq(parseEther('0.2'));
    expect(result[0].matched).eq(parseEther('40.407017003965518800'));
  });
});
