import { expect } from 'chai';
import { PROPOSALS_BASE_URI } from '../env';
import { PROPOSALS } from '../helpers/constants';
import { makeTestsEnv } from './helpers/make-tests-env';

makeTestsEnv(PROPOSALS, (testEnv) => {

  describe('getProposals', async () => {

    it('Should return list of 10 proposals', async () => {
      // given
      const { proposals, signers } = testEnv;
      // when
      const allProposals = await proposals.connect(signers.user).getProposals();

      // then
      expect(allProposals.length).eq(10);
      for (let i = 0; i < 10; i++) {
        expect(allProposals[i].id).eq(i);
        expect(allProposals[i].uri).eq(PROPOSALS_BASE_URI + i);
      }
    });

    it('Cannot change baseURI if not an owner', async () => {
      const { proposals, signers: { hacker } } = testEnv;
      expect(proposals.connect(hacker).setBaseURI("https://malicious.com"))
        .revertedWith('Ownable: caller is not the owner');
    });

    it('Cannot change proposals count if not an owner', async () => {
      const { proposals, signers: { hacker } } = testEnv;
      expect(proposals.connect(hacker).setProposalsCount(20))
        .revertedWith('Ownable: caller is not the owner');
    });

  });
});
