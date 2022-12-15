import { expect } from 'chai';
import chai from 'chai';
import { smock } from '@defi-wonderland/smock';
import { ethers } from 'hardhat';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS } from '../../helpers/constants';
import { getCurrentBlockNumber, mineBlocks } from '../../helpers/misc-utils';
import { Allocations, AllocationsStorage, Epochs, Tracker } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';
import { forwardEpochs } from '../../helpers/epochs-utils';

makeTestsEnv(ALLOCATIONS, (testEnv) => {

  let sTracker: Tracker;
  let allocationsStorage: AllocationsStorage;

  async function setupAllocations(start: number, duration: number, decisionWindow: number): Promise<[Epochs, Allocations]> {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs: Epochs = await epochsFactory.deploy(start, duration, decisionWindow) as Epochs;
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);

    sTracker = await smock.fake<Tracker>('Tracker');
    sTracker.depositAt.returns((_owner, _epochNo) => {
      return 1;
    });

    const allocations: Allocations = await allocationsFactory.deploy(epochs.address, allocationsStorage.address, sTracker.address) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    return [epochs, allocations];
  }

  describe('vote with real deposits', async () => {
    it("Can't vote if deposit is zero", async () => {
      const { allocations, epochs, signers: { Alice } } = testEnv;
      await forwardEpochs(epochs, 1);
      expect(allocations.connect(Alice).vote(1, 100)).revertedWith('HN/voting-blocked-if-deposit-is-zero');
    });
  });


  describe('vote (deposits faked)', async () => {

    let epochs: Epochs;
    let allocations: Allocations;

    beforeEach(async() => {
      let start = await getCurrentBlockNumber();
      [epochs, allocations] = await setupAllocations(start, 300, 100);
      await forwardEpochs(epochs, 1);
    });

    it('Cannot vote, when alpha is out of range', async () => {
      const { signers: { Alice } } = testEnv;
      expect(allocations.connect(Alice).vote(1, 101)).revertedWith('HN/alpha-out-of-range');
    });

    it('Should set alpha when vote', async () => {
      const { signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);

      const vote = await allocations.getUserVote(1, Alice.address);
      expect(vote.alpha).eq(53);
      expect(vote.proposalId).eq(1);
    });

    it('Can change alpha with next vote', async () => {
      const { signers: { Alice } } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(1, 75);

      const vote = await allocations.getUserVote(1, Alice.address)
      expect(vote.alpha).eq(75);
      expect(vote.proposalId).eq(1);
    });

    it('Users can vote', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;

      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Bob).vote(1, 75);
      await allocations.connect(Charlie).vote(5, 60);

      expect(await allocationsStorage.getVotesCount(1, 0)).eq(0);
      expect(await allocationsStorage.getVotesCount(1, 1)).eq(2);
      expect(await allocationsStorage.getVotesCount(1, 5)).eq(1);
    });

    it('User can change his vote', async () => {
      const { signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(2, 75);
      const vote = await allocations.getUserVote(1, Alice.address);

      expect(vote.proposalId).eq(2);
    });

    it('Vote emits proper event', async () => {
      const { signers: { Alice } } = testEnv;

      await expect(allocations.connect(Alice).vote(1, 53))
        .emit(allocations, 'Voted')
        .withArgs(1, Alice.address, 1, 53);
    });
  });
  describe('Tests with controlled epochs setup (deposits faked)', async() => {

    it('Users vote in second epoch', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getCurrentBlockNumber();
      let [epochs, allocations] = await setupAllocations(start, 500, 200)

      expect(await epochs.getCurrentEpoch()).eq(1);
      await mineBlocks(510)
      expect(await epochs.getCurrentEpoch()).eq(2);
      await allocations.connect(Alice).vote(1, 53);
      const voteInFirstEpoch = await allocations.getUserVote(1, Alice.address)
      const voteInSecondEpoch = await allocations.getUserVote(2, Alice.address)

      expect(voteInFirstEpoch.alpha).eq(53);
      expect(voteInFirstEpoch.proposalId).eq(1);
      expect(voteInSecondEpoch.alpha).eq(0);
      expect(voteInSecondEpoch.proposalId).eq(0);
    });

    it('Cannot vote when decision window closed', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getCurrentBlockNumber();
      let [_, allocations] = await setupAllocations(start, 500, 200)

      await mineBlocks(750);

      expect(allocations.connect(Alice).vote(1, 53))
        .revertedWith("HN/decision-window-closed");
    });

    it('Cannot vote when hexagon has not been started yet', async () => {
      const { signers: { Alice } } = testEnv;
      let [_, allocations] = await setupAllocations(2000000000, 500, 200)

      expect(allocations.connect(Alice).vote(1, 53))
        .revertedWith("HN/not-started-yet");
    });

  });
});
