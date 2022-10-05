import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DECISION_WINDOW, EPOCH_DURATION } from '../env';
import { ALLOCATIONS, EPOCHS, PROPOSALS } from '../helpers/constants';
import { increaseNextBlockTimestamp } from '../helpers/misc-utils';
import { Allocations, Epochs } from '../typechain-types';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, (testEnv) => {

  describe('vote', async () => {

    it('Cannot vote, when alpha is out of range', async () => {
      const { allocations, signers: { user } } = testEnv;
      expect(allocations.connect(user).vote(1, 101)).revertedWith('HN/alpha-out-of-range');
    });

    it('Should set alpha when vote', async () => {
      const { allocations, signers: { user } } = testEnv;

      await allocations.connect(user).vote(1, 53);

      expect(await allocations.getAlpha(1, user.address)).eq(53);
    });

    it('Can change alpha with next vote', async () => {
      const { allocations, signers: { user } } = testEnv;

      await allocations.connect(user).vote(1, 53);
      await allocations.connect(user).vote(1, 75);

      expect(await allocations.getAlpha(1, user.address)).eq(75);
    });

    it('Users can vote', async () => {
      const { allocations, signers: { user, user2, user3 } } = testEnv;

      await allocations.connect(user).vote(1, 53);
      await allocations.connect(user2).vote(1, 75);
      await allocations.connect(user3).vote(5, 60);

      expect(await allocations.getVotesCount(1, 0)).eq(0);
      expect(await allocations.getVotesCount(1, 1)).eq(2);
      expect(await allocations.getVotesCount(1, 5)).eq(1);
    });

    it('Users can change his vote', async () => {
      const { allocations, signers: { user } } = testEnv;

      await allocations.connect(user).vote(1, 53);
      await allocations.connect(user).vote(2, 75);
      const vote = await allocations.participantVoteByEpoch(1, user.address)

      expect(vote.proposalId).eq(2);
    });

    it('Users vote in second epoch', async () => {
      const { allocations, signers: { user } } = testEnv;

      await increaseNextBlockTimestamp(400_000)
      await allocations.connect(user).vote(1, 53);
      const voteInFirstEpoch = await allocations.participantVoteByEpoch(1, user.address)
      const voteInSecondEpoch = await allocations.participantVoteByEpoch(2, user.address)

      expect(voteInFirstEpoch.alpha).eq(0);
      expect(voteInFirstEpoch.proposalId).eq(0);
      expect(voteInSecondEpoch.alpha).eq(53);
      expect(voteInSecondEpoch.proposalId).eq(1);
    });

    it('Cannot vote when decision window closed', async () => {
      const { allocations, signers: { user } } = testEnv;

      await increaseNextBlockTimestamp(500_000);

      expect(allocations.connect(user).vote(1, 53))
        .revertedWith("HN/decision-window-closed");
    });

    it('Cannot vote when hexagon has not been started yet', async () => {
      const { signers: { user } } = testEnv;
      const epochsFactory = await ethers.getContractFactory(EPOCHS);
      const epochs = await epochsFactory.deploy(2000000000, EPOCH_DURATION, DECISION_WINDOW) as Epochs;
      const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);
      const allocations = await allocationsFactory.deploy(epochs.address) as Allocations;

      expect(allocations.connect(user).vote(1, 53))
        .revertedWith("HN/not-started-yet");
    });

    it('Vote emits proper event', async () => {
      const { allocations, signers: { user } } = testEnv;

      await expect(allocations.connect(user).vote(1, 53))
        .emit(allocations, 'Voted')
        .withArgs(1, user.address, 1, 53);
    });
  });
});
