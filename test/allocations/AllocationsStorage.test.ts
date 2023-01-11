import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
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

  describe('allocation', async () => {
    it('Can allocation', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, parseEther("0.5"));
      await allocationsStorage.connect(Alice).addAllocation(2, 2, Bob.address, parseEther("0.6"));

      const allocation1 = await allocationsStorage.getUserAllocation(1, Alice.address);
      expect(allocation1.allocation).eq(parseEther("0.5"));
      expect(allocation1.proposalId).eq(1);
      const allocation2 = await allocationsStorage.getUserAllocation(2, Bob.address);
      expect(allocation2.allocation).eq(parseEther("0.6"));
      expect(allocation2.proposalId).eq(2);
      const allocation3 = await allocationsStorage.getUserAllocation(3, Alice.address);
      expect(allocation3.allocation).eq(0);
      expect(allocation3.proposalId).eq(0);

      await allocationsStorage.connect(Alice).addAllocation(2, 3, Bob.address, parseEther("0.7"));
      const allocation4 = await allocationsStorage.getUserAllocation(2, Bob.address);
      expect(allocation4.allocation).eq(parseEther("0.7"));
      expect(allocation4.proposalId).eq(3);
    });
  });

  describe('addAllocation', async () => {
    it('Calculate allocations count properly', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 3, Charlie.address, 0);

      expect(await allocationsStorage.getAllocationsCount(1, 1)).eq(2);
      expect(await allocationsStorage.getAllocationsCount(1, 2)).eq(0);
      expect(await allocationsStorage.getAllocationsCount(1, 3)).eq(1);
    });

    it('Can get user by index', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);

      expect(await allocationsStorage.getUser(1, 1, 1)).eq(Alice.address);
      expect(await allocationsStorage.getUser(1, 1, 2)).eq(Bob.address);
    });

    it('Can get all users', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);

      const [users, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(users.length).eq(2);
      expect(users[0]).eq(Alice.address);
      expect(users[1]).eq(Bob.address);
    });

    it('Cannot allocate twice', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      expect(allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0))
        .revertedWith('HN/allocate-already-exists');
    });

    it('Only owner can allocate', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).addAllocation(1, 2, Alice.address, 0))
        .revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('removeAllocation', async () => {
    it('Can remove first allocation', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeAllocation(1, 1, Alice.address);

      const [users, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(users.length).eq(2);
      expect(users[0]).eq(Charlie.address);
      expect(users[1]).eq(Bob.address);
    });

    it('Can remove middle allocation', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeAllocation(1, 1, Bob.address);

      const [users, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(users.length).eq(2);
      expect(users[0]).eq(Alice.address);
      expect(users[1]).eq(Charlie.address);
    });

    it('Can remove last allocation', async () => {
      const { signers: { Alice, Bob, Charlie } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Charlie.address, 0);
      await allocationsStorage.connect(Alice).removeAllocation(1, 1, Charlie.address);

      const [users, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(users.length).eq(2);
      expect(users[0]).eq(Alice.address);
      expect(users[1]).eq(Bob.address);
    });

    it('Can add allocation after removal', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).removeAllocation(1, 1, Alice.address);
      await allocationsStorage.connect(Alice).addAllocation(1, 2, Alice.address, 0);

      const [usersProposal1, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(usersProposal1.length).eq(0);
      const [usersProposal2, __] = await allocationsStorage.getUsersWithTheirAllocations(1, 2);
      expect(usersProposal2.length).eq(1);
      expect(usersProposal2[0]).eq(Alice.address);
    });

    it('Allocations count after removal is correct', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, 1, Alice.address, 0);
      await allocationsStorage.connect(Alice).addAllocation(1, 1, Bob.address, 0);
      await allocationsStorage.connect(Alice).removeAllocation(1, 1, Alice.address);

      const count = await allocationsStorage.getAllocationsCount(1, 1);
      expect(count).eq(1);
    });

    it('Cannot remove allocation if it does not exist', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Alice).removeAllocation(1, 1, Alice.address))
        .revertedWith('HN/allocation-does-not-exist');
    });

    it('Only owner can remove allocation', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).removeAllocation(1, 2, Alice.address))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
