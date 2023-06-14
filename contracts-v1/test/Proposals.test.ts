import { expect } from 'chai';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { PROPOSALS_CID } from '../env';
import { PROPOSALS } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { Proposals } from '../typechain';

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

  describe('Epochs', async () => {
    it('not being set, should not prevent getProposals from functioning', async () => {
      // given
      const { auth, signers } = testEnv;
      const proposalsFactory = await ethers.getContractFactory(PROPOSALS);
      const proposalAddresses = await ethers
        .getUnnamedSigners()
        .then(proposals => proposals.slice(0, 10))
        .then(proposals => proposals.map(el => el.address));
      const proposals = (await proposalsFactory.deploy(
        PROPOSALS_CID,
        proposalAddresses,
        auth.address,
      )) as Proposals;

      // when
      expect(await proposals.epochs()).to.eq('0x0000000000000000000000000000000000000000');
      const proposalAddressesFromContract = await proposals
        .connect(signers.Alice)
        .getProposalAddresses(0);

      // then
      expect(proposalAddressesFromContract.length).eq(10);
    });

    it("not being set, don't prevent setProposalAddresses from working", async () => {
      // given
      const { auth, signers } = testEnv;
      const proposalsFactory = await ethers.getContractFactory(PROPOSALS);
      const proposalAddresses = await ethers
        .getUnnamedSigners()
        .then(proposals => proposals.slice(0, 10))
        .then(proposals => proposals.map(el => el.address));
      const proposals = (await proposalsFactory.deploy(
        PROPOSALS_CID,
        proposalAddresses,
        auth.address,
      )) as Proposals;

      // when
      expect(await proposals.epochs()).to.eq('0x0000000000000000000000000000000000000000');
      await proposals.connect(signers.TestFoundation).setProposalAddresses(0, newProposals);
      const cid = await proposals.cid();
      const proposalAddressesFromContract = await proposals.getProposalAddresses(1);

      // then
      expect(proposalAddressesFromContract.length).eq(11);
      for (let i = 0; i < newProposals.length; i++) {
        expect(`${cid}${proposalAddressesFromContract[i].toLowerCase()}`).eq(
          `${PROPOSALS_CID}${newProposals[i]}`,
        );
      }
    });
  });

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

    it('Should return list of updated proposals in future epoch', async () => {
      // given
      const {
        proposals,
        signers: { TestFoundation },
      } = testEnv;

      // when
      await proposals.connect(TestFoundation).setProposalAddresses(5, newProposals);
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

    it('Should return list of updated proposals in current epoch', async () => {
      // given
      const {
        proposals,
        signers: { TestFoundation },
      } = testEnv;

      // when
      await proposals.connect(TestFoundation).setProposalAddresses(1, newProposals);
      const cid = await proposals.cid();
      const proposalAddressesFromContract = await proposals.getProposalAddresses(1);

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
      const {
        proposals,
        proposalAddresses,
        signers: { TestFoundation },
      } = testEnv;
      // when
      await proposals.connect(TestFoundation).setProposalAddresses(5, newProposals);
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

    it('Cannot change historical proposals', async () => {
      const {
        epochs,
        proposals,
        signers: { TestFoundation },
      } = testEnv;
      expect(await proposals.epochs()).to.not.eq('0x0000000000000000000000000000000000000000');

      // when
      await forwardEpochs(epochs, 3);

      // then
      await expect(
        proposals.connect(TestFoundation).setProposalAddresses(1, newProposals),
      ).revertedWith('HN:Proposals/only-future-proposals-changing-is-allowed');
    });

    it('Cannot change baseURI if not a deployer', async () => {
      const {
        proposals,
        signers: { Darth },
      } = testEnv;
      await expect(proposals.connect(Darth).setCID('https://malicious.com')).revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });

    it('Cannot change proposals addresses if not a deployer', async () => {
      const {
        proposals,
        signers: { Darth },
      } = testEnv;
      await expect(proposals.connect(Darth).setProposalAddresses(1, newProposals)).revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });
  });

  describe('Authorized account', async () => {
    it('Proposal account is authorized', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { TestFoundation },
      } = testEnv;

      const isAuthorized = await proposals
        .connect(TestFoundation)
        .isAuthorized(proposalAddresses[0].address, proposalAddresses[0].address);

      expect(isAuthorized).true;
    });

    it('Authorized account is not set by default', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { Alice, TestFoundation },
      } = testEnv;

      const isAuthorized = await proposals
        .connect(TestFoundation)
        .isAuthorized(proposalAddresses[0].address, Alice.address);

      expect(isAuthorized).false;
    });

    it('Authorized account can be set by owner', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { Alice, TestFoundation },
      } = testEnv;

      await proposals
        .connect(TestFoundation)
        .setAuthorizedAccount(proposalAddresses[0].address, Alice.address);
      const isAuthorized = await proposals.isAuthorized(
        proposalAddresses[0].address,
        Alice.address,
      );

      expect(isAuthorized).true;
    });

    it('Authorizing account doesnt authorize other users', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { Alice, Bob, TestFoundation },
      } = testEnv;

      await proposals
        .connect(TestFoundation)
        .setAuthorizedAccount(proposalAddresses[0].address, Alice.address);
      const isAuthorized = await proposals.isAuthorized(proposalAddresses[0].address, Bob.address);

      expect(isAuthorized).false;
    });

    it('Authorized account can be changed by owner', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { Alice, Bob, TestFoundation },
      } = testEnv;

      await proposals
        .connect(TestFoundation)
        .setAuthorizedAccount(proposalAddresses[0].address, Alice.address);
      await proposals
        .connect(TestFoundation)
        .setAuthorizedAccount(proposalAddresses[0].address, Bob.address);
      const isAuthorized = await proposals.isAuthorized(proposalAddresses[0].address, Bob.address);

      expect(isAuthorized).true;
    });

    it('Authorized account cannot be set by other account', async () => {
      const {
        proposals,
        proposalAddresses,
        signers: { Darth },
      } = testEnv;

      await expect(
        proposals.connect(Darth).setAuthorizedAccount(proposalAddresses[0].address, Darth.address),
      ).revertedWith('HN:Common/unauthorized-caller');
    });
  });
});
