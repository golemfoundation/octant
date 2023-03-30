import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { ALLOCATIONS_STORAGE } from '../../helpers/constants';
import { AllocationsStorage } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS_STORAGE, testEnv => {
  async function setupContract(newOwner: string) {
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = (await allocationsStorageFactory.deploy()) as AllocationsStorage;
    await allocationsStorage.setAllocations(newOwner);
    return allocationsStorage;
  }

  describe('Allocate', async () => {
    it('Users can allocate', async () => {
      const {
        signers: { Alice, Bob },
        proposalAddresses,
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: parseEther('0.5'),
        proposal: proposalAddresses[0].address,
      });
      await allocationsStorage.connect(Alice).addAllocation(2, Bob.address, {
        allocation: parseEther('0.6'),
        proposal: proposalAddresses[1].address,
      });

      const aliceAllocations = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(aliceAllocations.length).eq(1);
      expect(aliceAllocations[0].allocation).eq(parseEther('0.5'));
      expect(aliceAllocations[0].proposal).eq(proposalAddresses[0].address);
      const bobAllocations = await allocationsStorage.getUserAllocations(2, Bob.address);
      expect(bobAllocations.length).eq(1);
      expect(bobAllocations[0].allocation).eq(parseEther('0.6'));
      expect(bobAllocations[0].proposal).eq(proposalAddresses[1].address);
      const [undefinedAliceAllocation] = await allocationsStorage.getUserAllocations(
        3,
        Alice.address,
      );
      expect(undefinedAliceAllocation).eq(undefined);

      await allocationsStorage.connect(Alice).addAllocation(2, Bob.address, {
        allocation: parseEther('0.7'),
        proposal: proposalAddresses[2].address,
      });
      const bobAllocationsAfterUpdate = await allocationsStorage.getUserAllocations(2, Bob.address);
      expect(bobAllocationsAfterUpdate.length).eq(2);
      expect(bobAllocationsAfterUpdate[0].allocation).eq(parseEther('0.6'));
      expect(bobAllocationsAfterUpdate[0].proposal).eq(proposalAddresses[1].address);
      expect(bobAllocationsAfterUpdate[1].allocation).eq(parseEther('0.7'));
      expect(bobAllocationsAfterUpdate[1].proposal).eq(proposalAddresses[2].address);
    });

    it('Users can add claimable rewards', async () => {
      const {
        signers: { Alice, Bob },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      const aliceClaimableRewardBeforeAdding = await allocationsStorage.getUserClaimableRewards(
        1,
        Alice.address,
      );
      expect(aliceClaimableRewardBeforeAdding).eq(0);

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.5'));
      await allocationsStorage.connect(Alice).putClaimableReward(2, Bob.address, parseEther('0.6'));
      const aliceClaimableReward = await allocationsStorage.getUserClaimableRewards(
        1,
        Alice.address,
      );
      expect(aliceClaimableReward).eq(parseEther('0.5'));
      const bobClaimableReward = await allocationsStorage.getUserClaimableRewards(2, Bob.address);
      expect(bobClaimableReward).eq(parseEther('0.6'));

      const aliceClaimableRewardInAnotherEpoch = await allocationsStorage.getUserClaimableRewards(
        3,
        Alice.address,
      );
      expect(aliceClaimableRewardInAnotherEpoch).eq(0);

      await allocationsStorage.connect(Alice).putClaimableReward(2, Bob.address, parseEther('0.7'));
      const aliceClaimableRewardAfterUpdate = await allocationsStorage.getUserClaimableRewards(
        1,
        Alice.address,
      );
      expect(aliceClaimableRewardAfterUpdate).eq(parseEther('0.5'));
      const bobClaimableRewardAfterUpdate = await allocationsStorage.getUserClaimableRewards(
        2,
        Bob.address,
      );
      expect(bobClaimableRewardAfterUpdate).eq(parseEther('0.7'));
    });

    it('Total claimable rewards are summed from multiple users', async () => {
      const {
        signers: { Alice, Bob },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      const totalBeforeAllocating = await allocationsStorage.getTotalClaimableRewards(1);
      expect(totalBeforeAllocating).eq(0);

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.5'));
      await allocationsStorage.connect(Alice).putClaimableReward(1, Bob.address, parseEther('0.6'));
      const totalClaimableRewards = await allocationsStorage.getTotalClaimableRewards(1);

      expect(totalClaimableRewards).eq(parseEther('1.1'));
    });

    it('Total claimable rewards can be increased', async () => {
      const {
        signers: { Alice, Bob },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.5'));
      await allocationsStorage.connect(Alice).putClaimableReward(1, Bob.address, parseEther('0.6'));

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.50043'));

      const totalClaimableRewards = await allocationsStorage.getTotalClaimableRewards(1);

      expect(totalClaimableRewards).eq(parseEther('1.10043'));
    });

    it('Total claimable rewards can be decreased', async () => {
      const {
        signers: { Alice, Bob },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.5'));
      await allocationsStorage.connect(Alice).putClaimableReward(1, Bob.address, parseEther('0.6'));

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Bob.address, parseEther('0.202'));

      const totalClaimableRewards = await allocationsStorage.getTotalClaimableRewards(1);

      expect(totalClaimableRewards).eq(parseEther('0.702'));
    });

    it('Total claimable rewards from one epoch does not influence the other', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage
        .connect(Alice)
        .putClaimableReward(1, Alice.address, parseEther('0.5'));

      const totalClaimableRewards = await allocationsStorage.getTotalClaimableRewards(2);

      expect(totalClaimableRewards).eq(0);
    });
  });

  describe('addAllocation', async () => {
    it('Gets allocation on proposal from all users', async () => {
      const {
        signers: { Alice, Bob },
        proposalAddresses,
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: 1,
        proposal: proposalAddresses[0].address,
      });
      await allocationsStorage.connect(Alice).addAllocation(1, Bob.address, {
        allocation: 1,
        proposal: proposalAddresses[0].address,
      });

      const proposalAllocation = await allocationsStorage.getProposalAllocation(
        1,
        proposalAddresses[0].address,
      );
      expect(proposalAllocation).eq(2);
    });

    it('Only owner can allocate', async () => {
      const {
        signers: { Alice, Bob },
        proposalAddresses,
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(
        allocationsStorage.connect(Bob).addAllocation(1, Alice.address, {
          allocation: 1,
          proposal: proposalAddresses[0].address,
        }),
      ).revertedWith('HN:Common/unauthorized-caller');
    });
  });

  describe('removeAllocation', async () => {
    it('Can add allocation after removal', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: 1,
        proposal: proposalAddresses[0].address,
      });
      await allocationsStorage.connect(Alice).removeUserAllocations(1, Alice.address);
      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: 1,
        proposal: proposalAddresses[1].address,
      });

      const proposal1Allocation = await allocationsStorage.getProposalAllocation(
        1,
        proposalAddresses[0].address,
      );
      expect(proposal1Allocation).eq(0);
      const proposal2Allocation = await allocationsStorage.getProposalAllocation(
        1,
        proposalAddresses[1].address,
      );
      expect(proposal2Allocation).eq(1);
    });

    it('Allocations count after removal is 0', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: 1,
        proposal: proposalAddresses[0].address,
      });
      await allocationsStorage.connect(Alice).addAllocation(1, Alice.address, {
        allocation: 2,
        proposal: proposalAddresses[1].address,
      });
      await allocationsStorage.connect(Alice).removeUserAllocations(1, Alice.address);

      const userAllocations = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(userAllocations.length).eq(0);
    });

    it('Only owner can remove allocation', async () => {
      const {
        signers: { Alice, Bob },
      } = testEnv;
      const allocationsStorage = await setupContract(Alice.address);

      expect(allocationsStorage.connect(Bob).removeUserAllocations(1, Alice.address)).revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });
  });
});
