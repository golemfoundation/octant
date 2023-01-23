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

  describe('Allocate', async () => {
    it('Users can allocate', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: parseEther("0.5")
      });
      await allocationsStorage.connect(Alice).addAllocation(2, Bob.address, {
        proposalId: 2,
        allocation: parseEther("0.6")
      });

      const aliceAllocations = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(aliceAllocations.length).eq(1);
      expect(aliceAllocations[0].allocation).eq(parseEther('0.5'));
      expect(aliceAllocations[0].proposalId).eq(1);
      const bobAllocations = await allocationsStorage.getUserAllocations(2, Bob.address);
      expect(bobAllocations.length).eq(1);
      expect(bobAllocations[0].allocation).eq(parseEther('0.6'));
      expect(bobAllocations[0].proposalId).eq(2);
      const [undefinedAliceAllocation] = await allocationsStorage.getUserAllocations(3, Alice.address);
      expect(undefinedAliceAllocation).eq(undefined);

      await allocationsStorage.connect(Alice).addAllocation(2, Bob.address, {
        proposalId: 3,
        allocation: parseEther("0.7")
      });
      const bobAllocationsAfterUpdate = await allocationsStorage.getUserAllocations(2, Bob.address);
      expect(bobAllocationsAfterUpdate.length).eq(2);
      expect(bobAllocationsAfterUpdate[0].allocation).eq(parseEther('0.6'));
      expect(bobAllocationsAfterUpdate[0].proposalId).eq(2);
      expect(bobAllocationsAfterUpdate[1].allocation).eq(parseEther('0.7'));
      expect(bobAllocationsAfterUpdate[1].proposalId).eq(3);
    });
  });

  describe('addAllocation', async () => {
    it('Can get all users', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      });
      await allocationsStorage.connect(Alice).addAllocation(1, Bob.address, {
        proposalId: 1,
        allocation: 1
      });

      const [users, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(users.length).eq(2);
      expect(users[0]).eq(Alice.address);
      expect(users[1]).eq(Bob.address);
    });

    it('Cannot allocate twice', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      });
      expect(allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      }))
        .revertedWith('HN/allocate-already-exists');
    });

    it('Only owner can allocate', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      })).revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('removeAllocation', async () => {
    it('Can add allocation after removal', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      });
      await allocationsStorage.connect(Alice).removeUserAllocations(1, Alice.address);
      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 2,
        allocation: 1
      });

      const [usersProposal1, _] = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(usersProposal1.length).eq(0);
      const [usersProposal2, __] = await allocationsStorage.getUsersWithTheirAllocations(1, 2);
      expect(usersProposal2.length).eq(1);
      expect(usersProposal2[0]).eq(Alice.address);
    });

    it('Allocations count after removal is 0', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 1,
        allocation: 1
      });
      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        proposalId: 2,
        allocation: 2
      });
      await allocationsStorage.connect(Alice).removeUserAllocations(1, Alice.address);

      const userAllocations = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(userAllocations.length).eq(0);
    });

    it('Cannot remove allocation if it does not exist', async () => {
      const { signers: { Alice } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Alice).removeUserAllocations(1, Alice.address))
        .revertedWith('HN/allocation-does-not-exist');
    });

    it('Only owner can remove allocation', async () => {
      const { signers: { Alice, Bob } } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).removeUserAllocations(1, Alice.address))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
