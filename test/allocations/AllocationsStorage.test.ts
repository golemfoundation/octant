import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ALLOCATIONS_STORAGE } from '../../helpers/constants';
import { AllocationsStorage } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS_STORAGE, (testEnv) => {

  async function setupContract(newOwner: string) {
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = await allocationsStorageFactory.deploy() as AllocationsStorage;
    await allocationsStorage.transferOwnership(newOwner);
    return allocationsStorage;
  }

  describe('alpha', async () => {
    it('Can set vote by user', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 50);
      await allocationsStorage.connect(Alice).addVote(2, 2, Bob.address, 60);

      const vote1 = await allocationsStorage.getUserVote(1, Alice.address);
      expect(vote1.alpha).eq(50);
      expect(vote1.proposalId).eq(1);
      const vote2 = await allocationsStorage.getUserVote(2, Bob.address);
      expect(vote2.alpha).eq(60);
      expect(vote2.proposalId).eq(2);
      const vote3 = await allocationsStorage.getUserVote(3, Alice.address);
      expect(vote3.alpha).eq(0);
      expect(vote3.proposalId).eq(0);

      await allocationsStorage.connect(Alice).addVote(2, 3, Bob.address, 70);
      const vote4 = await allocationsStorage.getUserVote(2, Bob.address);
      expect(vote4.alpha).eq(70);
      expect(vote4.proposalId).eq(3);
    });
  });

  describe('addVote', async () => {
    it('Calculate votes count properly', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 3, Charlie.address, 0);

      expect(await allocationsStorage.getVotesCount(1, 1)).eq(2);
      expect(await allocationsStorage.getVotesCount(1, 2)).eq(0);
      expect(await allocationsStorage.getVotesCount(1, 3)).eq(1);
    });

    it('Can get voter by index', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);

      expect(await allocationsStorage.getUser(1, 1, 1)).eq(Alice.address);
      expect(await allocationsStorage.getUser(1, 1, 2)).eq(Bob.address);
    });

    it('Can get all voters', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);

      const [voters, _] = await allocationsStorage.getUsersAlphas(1, 1);
      expect(voters.length).eq(2);
      expect(voters[0]).eq(Alice.address);
      expect(voters[1]).eq(Bob.address);
    });

    it('Cannot vote twice', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      expect(allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0))
        .revertedWith('HN/vote-already-exists');
    });

    it('Only owner can vote', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).addVote(1, 2, Alice.address, 0))
        .revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('removeVote', async () => {
    it('Can remove first vote', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeVote(1, 1, Alice.address);

      const [voters, _] = await allocationsStorage.getUsersAlphas(1, 1);
      expect(voters.length).eq(2);
      expect(voters[0]).eq(Charlie.address);
      expect(voters[1]).eq(Bob.address);
    });

    it('Can remove middle vote', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeVote(1, 1, Bob.address);

      const [voters, _] = await allocationsStorage.getUsersAlphas(1, 1);
      expect(voters.length).eq(2);
      expect(voters[0]).eq(Alice.address);
      expect(voters[1]).eq(Charlie.address);
    });

    it('Can remove last vote', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeVote(1, 1, Charlie.address);

      const [voters, _] = await allocationsStorage.getUsersAlphas(1, 1);
      expect(voters.length).eq(2);
      expect(voters[0]).eq(Alice.address);
      expect(voters[1]).eq(Bob.address);
    });

    it('Can add vote after removal', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).removeVote(1, 1, Alice.address);
      await allocationsStorage.connect(Alice).addVote(1, 2, Alice.address, 0);

      const [votersProposal1, _] = await allocationsStorage.getUsersAlphas(1, 1);
      expect(votersProposal1.length).eq(0);
      const [votersProposal2, __] = await allocationsStorage.getUsersAlphas(1, 2);
      expect(votersProposal2.length).eq(1);
      expect(votersProposal2[0]).eq(Alice.address);
    });

    it('Votes count after removal is correct', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addVote(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addVote(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).removeVote(1, 1, Alice.address);

      const count = await allocationsStorage.getVotesCount(1, 1);
      expect(count).eq(1);
    });

    it('Cannot remove vote if it does not exist', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Alice).removeVote(1, 1, Alice.address))
        .revertedWith('HN/vote-does-not-exist');
    });

    it('Only owner can remove vote', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).removeVote(1, 2, Alice.address))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
