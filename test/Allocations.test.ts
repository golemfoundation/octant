import { expect } from 'chai';
import { PROPOSALS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(PROPOSALS, (testEnv) => {

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

    it('Vote emits proper event', async () => {
      const { allocations, signers: { user } } = testEnv;

      await expect(allocations.connect(user).vote(1, 53))
        .emit(allocations, 'Voted')
        .withArgs(1, user.address, 1, 53);
    });
  });
});
