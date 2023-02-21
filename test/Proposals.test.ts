import { expect } from 'chai';

import { makeTestsEnv } from './helpers/make-tests-env';

import { PROPOSALS_CID } from '../env';
import { PROPOSALS } from '../helpers/constants';

makeTestsEnv(PROPOSALS, testEnv => {
  const newProposals = [
    '0x51c11b29066e15c43a4f4a1eef2d2c3b3e2b8935',
    '0xc3f42af54c9c9f4275e7cf5ed5a360b59aa46de1',
    '0x0b0484e4e4a4e7edc0f2d02e3b65af76b40b0d3d',
    '0x9a0f22c15fba5a5c8f16710f07ec0e22d715d1e3',
    '0xc2d7cf95645d87b92c6e20529b810f56773112a2',
    '0x9c1b56d6c66dc6d8a0230d931f6d399f1a0b2cd8',
    '0x7a27b71d88b8c07e80a04463eb721d45f1381e8a',
    '0x7d98c695a3f7f3dc5a2a7d48a53e91d7a5a9eb03',
    '0x1b1c78fb99d0981eb37b697c67266b64a4e4e9b4',
    '0xb2cc5b5a5b5aa5f7d5d13113b57a36aa7070c123',
    '0x3c1b8802b304f3b8e3e3d1c60d2f9e45d10c77da',
  ];

  describe('getProposals', async () => {
    it('Should return list of default proposals', async () => {
      // given
      const { proposals, signers, proposalAddresses } = testEnv;

      // when
      const cid = await proposals.cid();
      const proposalAddressesFromContract = await proposals
        .connect(signers.Alice)
        .getProposalAddresses(5);

      // then
      expect(proposalAddressesFromContract.length).eq(10);
      for (let i = 0; i < 10; i++) {
        expect(`${cid}${proposalAddressesFromContract[i].toLowerCase()}`).eq(
          `${PROPOSALS_CID}${proposalAddresses[i].address.toLowerCase()}`,
        );
      }
    });

    it('Should return list of updated proposals', async () => {
      // given
      const { proposals } = testEnv;

      // when
      await proposals.setProposalAddresses(5, newProposals);
      const cid = await proposals.cid();
      const proposalAddressesFromContract = await proposals.getProposalAddresses(7);

      // then
      expect(proposalAddressesFromContract.length).eq(11);
      for (let i = 0; i < newProposals.length; i++) {
        expect(`${cid}${proposalAddressesFromContract[i].toLowerCase()}`).eq(
          `${PROPOSALS_CID}${newProposals[i]}`,
        );
      }
    });

    it('Should return list of default proposals when call for epoch before update', async () => {
      // given
      const { proposals, proposalAddresses } = testEnv;
      // when
      await proposals.setProposalAddresses(5, newProposals);
      const cid = await proposals.cid();
      const proposalAddressesFromContract = await proposals.getProposalAddresses(4);

      // then
      expect(proposalAddressesFromContract.length).eq(10);
      for (let i = 0; i < 10; i++) {
        expect(`${cid}${proposalAddressesFromContract[i].toLowerCase()}`).eq(
          `${PROPOSALS_CID}${proposalAddresses[i].address.toLowerCase()}`,
        );
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
      expect(proposals.connect(Darth).setProposalAddresses(1, newProposals)).revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });
});
