import { smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { getLatestBlockTimestamp, increaseNextBlockTimestamp } from '../../helpers/misc-utils';
import { Allocations, AllocationsStorage, Epochs, Rewards } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, (testEnv) => {

  async function setupAllocations(start: number, duration: number, decisionWindow: number): Promise<[Epochs, Allocations, AllocationsStorage]> {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs: Epochs = await epochsFactory.deploy(start, duration, decisionWindow) as Epochs;
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);

    const sRewards = await smock.fake<Rewards>('Rewards');
    sRewards.individualReward.returns((_owner: string, _epochNo: number) => {
      return parseEther('0.4');
    });

    const allocations: Allocations = await allocationsFactory.deploy(epochs.address, allocationsStorage.address, sRewards.address) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    return [epochs, allocations, allocationsStorage];
  }

  describe('Allocate with real deposits', async () => {

    describe('No rewards', async () => {
      it('Cannot allocate if deposit is zero', async () => {
        const { allocations, epochs, signers: { Alice } } = testEnv;
        await forwardEpochs(epochs, 1);
        await expect(allocations.connect(Alice).allocate(1, 100))
          .revertedWith('HN:Allocations/allocate-above-rewards-budget');
      });
    });

    describe('With rewards', async () => {

      beforeEach(async () => {
        const {
          token,
          glmDeposits,
          beaconChainOracle,
          executionLayerOracle,
          epochs,
          signers: { Alice }
        } = testEnv;
        await token.transfer(Alice.address, parseEther('1000000'));
        await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
        await glmDeposits.connect(Alice).deposit(parseEther('1000000'));
        await forwardEpochs(epochs, 1);
        await beaconChainOracle.setBalance(1, parseEther('200'));
        await executionLayerOracle.setBalance(1, parseEther('200'));
        await forwardEpochs(epochs, 1);
        await beaconChainOracle.setBalance(2, parseEther('400'));
        await executionLayerOracle.setBalance(2, parseEther('400'));
        // Alice individual reward equals 0.4 ETH
      });

      it('Cannot allocate if individual reward is lower than funds to allocate', async () => {
        const { allocations, signers: { Alice } } = testEnv;
        await expect(allocations.connect(Alice).allocate(1, parseEther('0.5')))
          .revertedWith('HN:Allocations/allocate-above-rewards-budget');
      });

      it('Can allocate if individual reward is equals to funds to allocate', async () => {
        const { allocations, allocationsStorage, epochs, signers: { Alice } } = testEnv;
        await allocations.connect(Alice).allocate(1, parseEther('0.4'));
        const currentEpoch = await epochs.getCurrentEpoch();
        const userAllocation = await allocationsStorage.getUserAllocation(currentEpoch - 1, Alice.address);
        expect(userAllocation.allocation).eq(parseEther('0.4'));
      });

      it('Can allocate if individual reward is higher than funds to allocate', async () => {
        const { allocations, allocationsStorage, epochs, signers: { Alice } } = testEnv;
        await allocations.connect(Alice).allocate(1, parseEther('0.3'));
        const currentEpoch = await epochs.getCurrentEpoch();
        const userAllocation = await allocationsStorage.getUserAllocation(currentEpoch - 1, Alice.address);
        expect(userAllocation.allocation).eq(parseEther('0.3'));
      });
    });
  });


  describe('Allocate (deposits faked)', async () => {

    let epochs: Epochs;
    let allocations: Allocations;
    let allocationsStorage: AllocationsStorage;

    beforeEach(async () => {
      let start = await getLatestBlockTimestamp();
      [epochs, allocations, allocationsStorage] = await setupAllocations(start, 300, 100);
      await forwardEpochs(epochs, 1);
    });

    it('Cannot allocate for proposal with id 0', async () => {
      const { allocations, epochs, signers: { Alice } } = testEnv;
      await forwardEpochs(epochs, 1);
      await expect(allocations.connect(Alice).allocate(0, parseEther('0.4')))
        .revertedWith('HN:Allocations/proposal-id-equals-0');
    });

    it('Should set allocation', async () => {
      const { signers: { Alice } } = testEnv;

      await allocations.connect(Alice).allocate(1, parseEther('0.4'));

      const allocation = await allocationsStorage.getUserAllocation(1, Alice.address);
      expect(allocation.allocation).eq(parseEther('0.4'));
      expect(allocation.proposalId).eq(1);
    });

    it('Can change allocation', async () => {
      const { signers: { Alice } } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate(1, parseEther('0.4'));
      await allocations.connect(Alice).allocate(1, parseEther('0.2'));

      const allocation = await allocationsStorage.getUserAllocation(1, Alice.address);
      expect(allocation.allocation).eq(parseEther('0.2'));
      expect(allocation.proposalId).eq(1);
    });

    it('Multiple users can allocate', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;

      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate(1, parseEther('0.4'));
      await allocations.connect(Bob).allocate(1, parseEther('0.13'));
      await allocations.connect(Charlie).allocate(5, parseEther('0.23'));

      expect(await allocationsStorage.getAllocationsCount(1, 0)).eq(0);
      expect(await allocationsStorage.getAllocationsCount(1, 1)).eq(2);
      expect(await allocationsStorage.getAllocationsCount(1, 5)).eq(1);
    });

    it('User can change his a proposal to allocate', async () => {
      const { signers: { Alice } } = testEnv;

      await allocations.connect(Alice).allocate(1, parseEther('0.4'));
      await allocations.connect(Alice).allocate(2, parseEther('0.234'));
      const allocation = await allocationsStorage.getUserAllocation(1, Alice.address);

      expect(allocation.proposalId).eq(2);
    });

    it('Allocate emits proper event', async () => {
      const { signers: { Alice } } = testEnv;

      await expect(allocations.connect(Alice).allocate(1, parseEther('0.4')))
        .emit(allocations, 'Allocated')
        .withArgs(1, Alice.address, 1, parseEther('0.4'));
    });
  });

  describe('Tests with controlled epochs setup (deposits faked)', async () => {
    it('Users allocate in second epoch', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getLatestBlockTimestamp();
      let [epochs, allocations, allocationsStorage] = await setupAllocations(start, 500, 200);

      expect(await epochs.getCurrentEpoch()).eq(1);
      await forwardEpochs(epochs, 1);
      expect(await epochs.getCurrentEpoch()).eq(2);
      await allocations.connect(Alice).allocate(1, parseEther('0.4'));
      const allocationInFirstEpoch = await allocationsStorage.getUserAllocation(1, Alice.address);
      const allocationInSecondEpoch = await allocationsStorage.getUserAllocation(2, Alice.address);

      expect(allocationInFirstEpoch.allocation).eq(parseEther('0.4'));
      expect(allocationInFirstEpoch.proposalId).eq(1);
      expect(allocationInSecondEpoch.allocation).eq(0);
      expect(allocationInSecondEpoch.proposalId).eq(0);
    });

    it('Cannot allocate when decision window closed', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getLatestBlockTimestamp();
      let [_, allocations] = await setupAllocations(start, 500, 200);

      await increaseNextBlockTimestamp(750);

      await expect(allocations.connect(Alice).allocate(1, parseEther('0.4')))
        .revertedWith('HN:Allocations/decision-window-closed');
    });

    it('Cannot allocate when hexagon has not been started yet', async () => {
      const { signers: { Alice } } = testEnv;
      let [_, allocations] = await setupAllocations(2000000000, 500, 200);

      await expect(allocations.connect(Alice).allocate(1, parseEther('0.4')))
        .revertedWith('HN:Allocations/first-epoch-not-started-yet');
    });
  });
});
