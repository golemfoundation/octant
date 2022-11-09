import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DECISION_WINDOW, EPOCH_DURATION } from '../env';
import { ALLOCATIONS, EPOCHS, PROPOSALS } from '../helpers/constants';
import { getLatestBlockTimestamp, increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { Allocations, Epochs } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, (testEnv) => {

  async function setupAllocations(start: number, duration: number, decisionWindow: number) {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs = await epochsFactory.deploy(start, duration, decisionWindow) as Epochs;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);
    return await allocationsFactory.deploy(epochs.address) as Allocations;
  }

  describe('vote', async () => {
    it('Cannot vote, when alpha is out of range', async () => {
      const { allocations, signers: { Alice } } = testEnv;
      expect(allocations.connect(Alice).vote(1, 101)).revertedWith('HN/alpha-out-of-range');
    });

    it('Should set alpha when vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);

      expect(await allocations.getAlpha(1, Alice.address)).eq(53);
    });

    it('Can change alpha with next vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(1, 75);

      expect(await allocations.getAlpha(1, Alice.address)).eq(75);
    });

    it('Users can vote', async () => {
      const { allocations, signers: { Alice, Bob, Charlie } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Bob).vote(1, 75);
      await allocations.connect(Charlie).vote(5, 60);

      expect(await allocations.getVotesCount(1, 0)).eq(0);
      expect(await allocations.getVotesCount(1, 1)).eq(2);
      expect(await allocations.getVotesCount(1, 5)).eq(1);
    });

    it('Users can change his vote', async () => {
      const { allocations, signers: { Alice } } = testEnv;

      await allocations.connect(Alice).vote(1, 53);
      await allocations.connect(Alice).vote(2, 75);
      const vote = await allocations.participantVoteByEpoch(1, Alice.address)

      expect(vote.proposalId).eq(2);
    });

    it('Users vote in second epoch', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getLatestBlockTimestamp()
      const allocations = await setupAllocations(start, 500, 200)

      await increaseNextBlockTimestamp(600)
      await allocations.connect(Alice).vote(1, 53);
      const voteInFirstEpoch = await allocations.participantVoteByEpoch(1, Alice.address)
      const voteInSecondEpoch = await allocations.participantVoteByEpoch(2, Alice.address)

      expect(voteInFirstEpoch.alpha).eq(0);
      expect(voteInFirstEpoch.proposalId).eq(0);
      expect(voteInSecondEpoch.alpha).eq(53);
      expect(voteInSecondEpoch.proposalId).eq(1);
    });

    it('Cannot vote when decision window closed', async () => {
      const { signers: { Alice } } = testEnv;
      const start = await getLatestBlockTimestamp()
      const allocations = await setupAllocations(start, 500, 200)

      await increaseNextBlockTimestamp(400);

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
