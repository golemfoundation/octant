import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS } from '../../helpers/constants';
import { getCurrentBlockNumber, mineBlocks } from '../../helpers/misc-utils';
import { Allocations, AllocationsStorage, Epochs } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, (testEnv) => {

  async function setupAllocations(start: number, duration: number, decisionWindow: number) {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs = await epochsFactory.deploy(start, duration, decisionWindow) as Epochs;
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);
    const allocations =  await allocationsFactory.deploy(epochs.address, allocationsStorage.address) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    return allocations;
  }

  describe('vote', async () => {
    it('Cannot vote, when alpha is out of range', async () => {
      const { allocations, signers: { Alice } } = testEnv;
      expect(allocations.connect(Alice).vote(1, 101)).revertedWith('HN/alpha-out-of-range');
    });

    it('Should set alpha when vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);

      const vote = await allocations.getUserVote(1, Alice.address)
      expect(vote.alpha).eq(53);
      expect(vote.proposalId).eq(1);
    });

    it('Can change alpha with next vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(1, 75);

      const vote = await allocations.getUserVote(1, Alice.address)
      expect(vote.alpha).eq(75);
      expect(vote.proposalId).eq(1);
    });

    it('Users can vote', async () => {
      const { allocations, allocationsStorage, signers: { Alice, Bob, Charlie } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Bob).vote(1, 75);
      await allocations.connect(Charlie).vote(5, 60);

      expect(await allocationsStorage.getVotesCount(1, 0)).eq(0);
      expect(await allocationsStorage.getVotesCount(1, 1)).eq(2);
      expect(await allocationsStorage.getVotesCount(1, 5)).eq(1);
    });

    it('User can change his vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(2, 75);
      const vote = await allocations.getUserVote(1, Alice.address);

      expect(vote.proposalId).eq(2);
    });

    it('Users vote in second epoch', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getCurrentBlockNumber();
      const allocations = await setupAllocations(start, 500, 200)

      await mineBlocks(510)
      await allocations.connect(Alice).vote(1, 53);
      const voteInFirstEpoch = await allocations.getUserVote(1, Alice.address)
      const voteInSecondEpoch = await allocations.getUserVote(2, Alice.address)

      expect(voteInFirstEpoch.alpha).eq(0);
      expect(voteInFirstEpoch.proposalId).eq(0);
      expect(voteInSecondEpoch.alpha).eq(53);
      expect(voteInSecondEpoch.proposalId).eq(1);
    });

    it('Cannot vote when decision window closed', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getCurrentBlockNumber();
      const allocations = await setupAllocations(start, 500, 200)

      await mineBlocks(750);

      expect(allocations.connect(Alice).vote(1, 53))
        .revertedWith("HN/decision-window-closed");
    });

    it('Cannot vote when hexagon has not been started yet', async () => {
      const { signers: { Alice } } = testEnv;
      const allocations = await setupAllocations(2000000000, 500, 200)

      expect(allocations.connect(Alice).vote(1, 53))
        .revertedWith("HN/not-started-yet");
    });

    it('Vote emits proper event', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await expect(allocations.connect(Alice).vote(1, 53))
        .emit(allocations, 'Voted')
        .withArgs(1, Alice.address, 1, 53);
    });
  });
});
