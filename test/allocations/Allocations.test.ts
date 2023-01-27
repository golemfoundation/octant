import { smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { getLatestBlockTimestamp, increaseNextBlockTimestamp } from '../../helpers/misc-utils';
import { Allocations, AllocationsStorage, Epochs, Rewards } from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, testEnv => {
  async function setupAllocations(
    start: number,
    duration: number,
    decisionWindow: number,
  ): Promise<[Epochs, Allocations, AllocationsStorage]> {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs: Epochs = (await epochsFactory.deploy(start, duration, decisionWindow)) as Epochs;
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = (await allocationsStorageFactory.deploy()) as AllocationsStorage;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);

    const sRewards = await smock.fake<Rewards>('Rewards');
    sRewards.individualReward.returns((_owner: string, _epochNo: number) => {
      return parseEther('0.4');
    });

    const allocations: Allocations = (await allocationsFactory.deploy(
      epochs.address,
      allocationsStorage.address,
      sRewards.address,
    )) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    return [epochs, allocations, allocationsStorage];
  }

  describe('Allocate with real deposits', async () => {
    describe('No rewards', async () => {
      it('Cannot allocate if deposit is zero', async () => {
        const {
          allocations,
          epochs,
          signers: { Alice },
        } = testEnv;
        await forwardEpochs(epochs, 1);
        const userAllocations = [{ allocation: 100, proposalId: 1 }];
        await expect(allocations.connect(Alice).allocate(userAllocations)).revertedWith(
          'HN:Allocations/allocate-above-rewards-budget',
        );
      });
    });

    describe('With rewards', async () => {
      beforeEach(async () => {
        const {
          token,
          glmDeposits,
          beaconChainOracle,
          executionLayerOracle,
          epochs,
          signers: { Alice },
        } = testEnv;
        await token.transfer(Alice.address, parseEther('1000000'));
        await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
        await glmDeposits.connect(Alice).deposit(parseEther('1000000'));
        await forwardEpochs(epochs, 1);
        await beaconChainOracle.setBalance(1, parseEther('200'));
        await executionLayerOracle.setBalance(1, parseEther('200'));
        await forwardEpochs(epochs, 1);
        await beaconChainOracle.setBalance(2, parseEther('400'));
        await executionLayerOracle.setBalance(2, parseEther('400'));
        // Alice individual reward equals 0.4 ETH
      });

      it('Cannot allocate if individual reward is lower than funds to allocate', async () => {
        const {
          allocations,
          signers: { Alice },
        } = testEnv;
        const userAllocations = [{ allocation: parseEther('0.5'), proposalId: 1 }];
        await expect(allocations.connect(Alice).allocate(userAllocations)).revertedWith(
          'HN:Allocations/allocate-above-rewards-budget',
        );
      });

      it('Cannot allocate if individual reward is lower than funds to allocate in two proposals', async () => {
        const {
          allocations,
          signers: { Alice },
        } = testEnv;
        const userAllocations = [
          { allocation: parseEther('0.2'), proposalId: 1 },
          {
            allocation: parseEther('0.3'),
            proposalId: 2,
          },
        ];
        await expect(allocations.connect(Alice).allocate(userAllocations)).revertedWith(
          'HN:Allocations/allocate-above-rewards-budget',
        );
      });

      it('Can allocate if individual reward is equals to funds to allocate', async () => {
        const {
          allocations,
          allocationsStorage,
          epochs,
          signers: { Alice },
        } = testEnv;
        const userAllocations = [{ allocation: parseEther('0.4'), proposalId: 1 }];
        await allocations.connect(Alice).allocate(userAllocations);
        const currentEpoch = await epochs.getCurrentEpoch();
        const userAllocation = await allocationsStorage.getUserAllocations(
          currentEpoch - 1,
          Alice.address,
        );
        expect(userAllocation[0].allocation).eq(parseEther('0.4'));
      });

      it('Can allocate if individual reward is higher than funds to allocate', async () => {
        const {
          allocations,
          allocationsStorage,
          epochs,
          signers: { Alice },
        } = testEnv;
        const userAllocations = [{ allocation: parseEther('0.3'), proposalId: 1 }];
        await allocations.connect(Alice).allocate(userAllocations);
        const currentEpoch = await epochs.getCurrentEpoch();
        const userAllocation = await allocationsStorage.getUserAllocations(
          currentEpoch - 1,
          Alice.address,
        );
        expect(userAllocation[0].allocation).eq(parseEther('0.3'));
      });
    });
  });

  describe('Allocate (deposits faked)', async () => {
    let epochs: Epochs;
    let allocations: Allocations;
    let allocationsStorage: AllocationsStorage;

    beforeEach(async () => {
      const start = await getLatestBlockTimestamp();
      [epochs, allocations, allocationsStorage] = await setupAllocations(start, 300, 100);
      await forwardEpochs(epochs, 1);
    });

    it('Cannot allocate for proposal with id 0', async () => {
      const {
        allocations: currentTestAllocations,
        epochs: currentTestEpochs,
        signers: { Alice },
      } = testEnv;
      await forwardEpochs(currentTestEpochs, 1);
      const userAllocations = [{ allocation: parseEther('0.4'), proposalId: 0 }];
      await expect(currentTestAllocations.connect(Alice).allocate(userAllocations)).revertedWith(
        'HN:Allocations/proposal-id-equals-0',
      );
    });

    it('Can allocate to one proposal', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const userAllocations = [{ allocation: parseEther('0.4'), proposalId: 1 }];

      await allocations.connect(Alice).allocate(userAllocations);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(allocation[0].allocation).eq(parseEther('0.4'));
      expect(allocation[0].proposalId).eq(1);
    });

    it('Can allocate to multiple proposals', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const userAllocations = [
        { allocation: parseEther('0.001'), proposalId: 1 },
        { allocation: parseEther('0.04'), proposalId: 2 },
        { allocation: parseEther('0.2'), proposalId: 4 },
        { allocation: parseEther('0.000000009'), proposalId: 3 },
        { allocation: parseEther('0.1'), proposalId: 7 },
      ];

      await allocations.connect(Alice).allocate(userAllocations);

      const result = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(result[0].allocation).eq(parseEther('0.001'));
      expect(result[0].proposalId).eq(1);
      expect(result[1].allocation).eq(parseEther('0.04'));
      expect(result[1].proposalId).eq(2);
      expect(result[2].allocation).eq(parseEther('0.2'));
      expect(result[2].proposalId).eq(4);
      expect(result[3].allocation).eq(parseEther('0.000000009'));
      expect(result[3].proposalId).eq(3);
      expect(result[4].allocation).eq(parseEther('0.1'));
      expect(result[4].proposalId).eq(7);
    });

    it('Can change one allocation', async () => {
      const {
        signers: { Alice },
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposalId: 1,
        },
      ]);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.2'),
          proposalId: 1,
        },
      ]);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(allocation[0].allocation).eq(parseEther('0.2'));
      expect(allocation[0].proposalId).eq(1);
    });

    it('Can change to more allocations', async () => {
      const {
        signers: { Alice },
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.1'), proposalId: 1 },
        { allocation: parseEther('0.01'), proposalId: 2 },
      ]);
      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.009'), proposalId: 4 },
        { allocation: parseEther('0.00001'), proposalId: 5 },
        { allocation: parseEther('0.2'), proposalId: 1 },
      ]);

      const result = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(result).length(3);
      expect(result[0].allocation).eq(parseEther('0.009'));
      expect(result[0].proposalId).eq(4);
      expect(result[1].allocation).eq(parseEther('0.00001'));
      expect(result[1].proposalId).eq(5);
      expect(result[2].allocation).eq(parseEther('0.2'));
      expect(result[2].proposalId).eq(1);
    });

    it('Can change to less allocations', async () => {
      const {
        signers: { Alice },
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.009'), proposalId: 4 },
        { allocation: parseEther('0.00001'), proposalId: 5 },
        { allocation: parseEther('0.2'), proposalId: 1 },
      ]);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.1'), proposalId: 1 },
        { allocation: parseEther('0.01'), proposalId: 2 },
      ]);

      const result = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(result).length(2);
      expect(result[0].allocation).eq(parseEther('0.1'));
      expect(result[0].proposalId).eq(1);
      expect(result[1].allocation).eq(parseEther('0.01'));
      expect(result[1].proposalId).eq(2);
    });

    it('Multiple users can allocate', async () => {
      const {
        signers: { Alice, Bob, Charlie },
      } = testEnv;

      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposalId: 1,
        },
      ]);
      await allocations.connect(Bob).allocate([
        { allocation: parseEther('0.13'), proposalId: 1 },
        { allocation: parseEther('0.0002'), proposalId: 5 },
      ]);
      await allocations.connect(Charlie).allocate([
        {
          allocation: parseEther('0.23'),
          proposalId: 5,
        },
      ]);
      const proposal1allocations = await allocationsStorage.getUsersWithTheirAllocations(1, 1);
      expect(proposal1allocations[0].length).eq(2);
      expect(proposal1allocations[1].length).eq(2);
      const proposal3allocations = await allocationsStorage.getUsersWithTheirAllocations(1, 3);
      expect(proposal3allocations[0].length).eq(0);
      expect(proposal3allocations[1].length).eq(0);
      const proposal5allocations = await allocationsStorage.getUsersWithTheirAllocations(1, 5);
      expect(proposal5allocations[0].length).eq(2);
      expect(proposal5allocations[1].length).eq(2);
    });

    it('User can change his a proposal to allocate', async () => {
      const {
        signers: { Alice },
      } = testEnv;

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposalId: 1,
        },
      ]);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.234'),
          proposalId: 2,
        },
      ]);
      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);

      expect(allocation[0].proposalId).eq(2);
    });

    it('Allocate emits proper event', async () => {
      const {
        signers: { Alice },
      } = testEnv;

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposalId: 1,
          },
        ]),
      ).emit(allocations, 'Allocated');
    });
  });

  describe('Tests with controlled epochs setup (deposits faked)', async () => {
    it('Users allocate in second epoch', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const [epochs, allocations, allocationsStorage] = await setupAllocations(start, 500, 200);

      expect(await epochs.getCurrentEpoch()).eq(1);
      await forwardEpochs(epochs, 1);
      expect(await epochs.getCurrentEpoch()).eq(2);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposalId: 1,
        },
      ]);
      const allocationInFirstEpoch = await allocationsStorage.getUserAllocations(1, Alice.address);
      const allocationInSecondEpoch = await allocationsStorage.getUserAllocations(2, Alice.address);

      expect(allocationInFirstEpoch[0].allocation).eq(parseEther('0.4'));
      expect(allocationInFirstEpoch[0].proposalId).eq(1);
      expect(allocationInSecondEpoch.length).eq(0);
    });

    it('Cannot allocate when decision window closed', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const [_, allocations] = await setupAllocations(start, 500, 200);

      await increaseNextBlockTimestamp(750);

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposalId: 1,
          },
        ]),
      ).revertedWith('HN:Allocations/decision-window-closed');
    });

    it('Cannot allocate when hexagon has not been started yet', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      const [_, allocations] = await setupAllocations(2000000000, 500, 200);

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposalId: 1,
          },
        ]),
      ).revertedWith('HN:Allocations/first-epoch-not-started-yet');
    });
  });
});
