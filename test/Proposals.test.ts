import { expect } from 'chai';

import { makeTestsEnv } from './helpers/make-tests-env';

import { PROPOSALS_CID } from '../env';
import { PROPOSALS } from '../helpers/constants';

makeTestsEnv(PROPOSALS, testEnv => {
  describe('getProposals', async () => {
    it('Should return list of default proposals', async () => {
      // given
      const { proposals, signers } = testEnv;
      // when
      const allProposals = await proposals.connect(signers.Alice).getProposals(5);

      // then
      expect(allProposals.length).eq(10);
      for (let i = 0; i < 10; i++) {
        expect(allProposals[i].id).eq(i + 1);
        expect(allProposals[i].uri).eq(`${PROPOSALS_CID}${i + 1}`);
      }
    });

    it('Should return list of updated proposals', async () => {
      // given
      const { proposals } = testEnv;
      const newProposals = [1, 2, 3, 4, 5, 6, 8, 9, 12, 13, 14];
      // when
      await proposals.setProposalIds(5, [1, 2, 3, 4, 5, 6, 8, 9, 12, 13, 14]);
      const allProposals = await proposals.getProposals(7);

      // then
      expect(allProposals.length).eq(11);
      for (let i = 0; i < newProposals.length; i++) {
        expect(allProposals[i].id).eq(newProposals[i]);
        expect(allProposals[i].uri).eq(PROPOSALS_CID + newProposals[i]);
      }
    });

    it('Should return list of default proposals when call for epoch before update', async () => {
      // given
      const { proposals } = testEnv;
      // when
      await proposals.setProposalIds(5, [1, 2, 3, 4, 5, 6, 8, 9, 12, 13, 14]);
      const allProposals = await proposals.getProposals(4);

      // then
      expect(allProposals.length).eq(10);
      for (let i = 0; i < 10; i++) {
        expect(allProposals[i].id).eq(i + 1);
        expect(allProposals[i].uri).eq(`${PROPOSALS_CID}${i + 1}`);
      }
    });

    it('Cannot change baseURI if not an owner', async () => {
      const {
        proposals,
        signers: { Darth },
      } = testEnv;
      expect(proposals.connect(Darth).setCID('https://malicious.com')).revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('Cannot change proposals count if not an owner', async () => {
      const {
        proposals,
        signers: { Darth },
      } = testEnv;
      expect(proposals.connect(Darth).setProposalIds(1, [1, 2, 3, 4])).revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });
});
