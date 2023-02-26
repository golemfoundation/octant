import { smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers, deployments } from 'hardhat';

import { PROPOSALS_CID } from '../../env';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS, PROPOSALS } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { getLatestBlockTimestamp, increaseNextBlockTimestamp } from '../../helpers/misc-utils';
import {
  Allocations,
  AllocationsStorage,
  Epochs,
  Proposals,
  Rewards,
  WithdrawalsTargetV3,
} from '../../typechain-types';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(ALLOCATIONS, testEnv => {
  async function setupAllocations(
    start: number,
    duration: number,
    decisionWindow: number,
  ): Promise<[Epochs, Allocations, AllocationsStorage, Proposals]> {
    const epochsFactory = await ethers.getContractFactory(EPOCHS);
    const epochs: Epochs = (await epochsFactory.deploy(start, duration, decisionWindow)) as Epochs;
    const allocationsStorageFactory = await ethers.getContractFactory(ALLOCATIONS_STORAGE);
    const allocationsStorage = (await allocationsStorageFactory.deploy()) as AllocationsStorage;
    const allocationsFactory = await ethers.getContractFactory(ALLOCATIONS);

    const proposalsFactory = await ethers.getContractFactory(PROPOSALS);
    // eslint-disable-next-line no-undef

    const proposalAddresses = await ethers
      .getUnnamedSigners()
      .then(proposals => proposals.slice(0, 10))
      .then(proposals => proposals.map(el => el.address));
    const proposals = (await proposalsFactory.deploy(
      PROPOSALS_CID,
      proposalAddresses,
    )) as Proposals;

    const sRewards = await smock.fake<Rewards>('Rewards');
    sRewards.individualReward.returns((_owner: string, _epochNo: number) => {
      return parseEther('0.4');
    });

    const allocations: Allocations = (await allocationsFactory.deploy(
      epochs.address,
      allocationsStorage.address,
      sRewards.address,
      proposals.address,
    )) as Allocations;
    await allocationsStorage.transferOwnership(allocations.address);

    return [epochs, allocations, allocationsStorage, proposals];
  }

  describe('Allocate with real deposits', async () => {
    describe('No rewards', async () => {
      it('Cannot allocate if deposit is zero', async () => {
        const {
          allocations,
          epochs,
          signers: { Alice },
          proposalAddresses,
        } = testEnv;
        await forwardEpochs(epochs, 1);
        const userAllocations = [{ allocation: 100, proposal: proposalAddresses[0].address }];
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
          octantOracle,
          epochs,
          signers: { deployer, Alice },
        } = testEnv;
        const { deploy } = deployments;
        const t = await deploy('WithdrawalsTarget', {
          contract: 'WithdrawalsTargetV3',
          from: deployer.address,
          proxy: true,
        });
        const target: WithdrawalsTargetV3 = await ethers.getContractAt(
          'WithdrawalsTargetV3',
          t.address,
        );
        await token.transfer(Alice.address, parseEther('1000000'));
        await token.connect(Alice).approve(glmDeposits.address, parseEther('1000000'));
        await glmDeposits.connect(Alice).lock(parseEther('1000000'));
        expect(await epochs.getCurrentEpoch()).eq(1);
        await target.sendETH({ value: ethers.utils.parseEther('400.0') });
        await forwardEpochs(epochs, 1);
        expect(await epochs.getCurrentEpoch()).eq(2);
        await octantOracle.writeBalance();
        await target.sendETH({ value: ethers.utils.parseEther('400.0') });
        await forwardEpochs(epochs, 1);
        expect(await epochs.getCurrentEpoch()).eq(3);
        await octantOracle.writeBalance();
        // Alice individual reward equals 0.4 ETH
      });

      it('Cannot allocate if individual reward is lower than funds to allocate', async () => {
        const {
          allocations,
          signers: { Alice },
          proposalAddresses,
        } = testEnv;
        const userAllocations = [
          { allocation: parseEther('0.5'), proposal: proposalAddresses[0].address },
        ];
        await expect(allocations.connect(Alice).allocate(userAllocations)).revertedWith(
          'HN:Allocations/allocate-above-rewards-budget',
        );
      });

      it('Cannot allocate if individual reward is lower than funds to allocate in two proposals', async () => {
        const {
          allocations,
          signers: { Alice },
          proposalAddresses,
        } = testEnv;
        const userAllocations = [
          { allocation: parseEther('0.2'), proposal: proposalAddresses[0].address },
          {
            allocation: parseEther('0.3'),
            proposal: proposalAddresses[1].address,
          },
        ];
        await expect(allocations.connect(Alice).allocate(userAllocations)).revertedWith(
          'HN:Allocations/allocate-above-rewards-budget',
        );
      });

      it('Can allocate if individual reward is equal to funds to allocate', async () => {
        const {
          allocations,
          allocationsStorage,
          epochs,
          signers: { Alice },
          proposalAddresses,
        } = testEnv;
        const userAllocations = [
          { allocation: parseEther('0.4'), proposal: proposalAddresses[0].address },
        ];
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
          proposalAddresses,
        } = testEnv;
        const userAllocations = [
          { allocation: parseEther('0.3'), proposal: proposalAddresses[0].address },
        ];
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

    it('Cannot allocate for proposal with invalid address', async () => {
      const {
        allocations: currentTestAllocations,
        epochs: currentTestEpochs,
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      await forwardEpochs(currentTestEpochs, 1);
      const userAllocations = [
        { allocation: parseEther('0.4'), proposal: proposalAddresses[0].address },
        { allocation: parseEther('0.4'), proposal: '0x1234560000000000000000000000000000000000' },
      ];
      await expect(currentTestAllocations.connect(Alice).allocate(userAllocations)).revertedWith(
        'HN:Allocations/no-such-proposal',
      );
    });

    it('Can allocate to one proposal', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const userAllocations = [
        { allocation: parseEther('0.4'), proposal: proposalAddresses[0].address },
      ];

      await allocations.connect(Alice).allocate(userAllocations);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      const claimableRewards = await allocationsStorage.getUserClaimableRewards(1, Alice.address);
      expect(allocation[0].allocation).eq(parseEther('0.4'));
      expect(allocation[0].proposal).eq(proposalAddresses[0].address);
      expect(claimableRewards).eq(0);
    });

    it('Can allocate to multiple proposals', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const userAllocations = [
        { allocation: parseEther('0.001'), proposal: proposalAddresses[0].address },
        { allocation: parseEther('0.04'), proposal: proposalAddresses[1].address },
        { allocation: parseEther('0.2'), proposal: proposalAddresses[3].address },
        { allocation: parseEther('0.000000009'), proposal: proposalAddresses[2].address },
        { allocation: parseEther('0.1'), proposal: proposalAddresses[6].address },
      ];

      await allocations.connect(Alice).allocate(userAllocations);
      const claimableRewards = await allocationsStorage.getUserClaimableRewards(1, Alice.address);

      const result = await allocationsStorage.getUserAllocations(1, Alice.address);
      expect(result[0].allocation).eq(parseEther('0.001'));
      expect(result[0].proposal).eq(proposalAddresses[0].address);
      expect(result[1].allocation).eq(parseEther('0.04'));
      expect(result[1].proposal).eq(proposalAddresses[1].address);
      expect(result[2].allocation).eq(parseEther('0.2'));
      expect(result[2].proposal).eq(proposalAddresses[3].address);
      expect(result[3].allocation).eq(parseEther('0.000000009'));
      expect(result[3].proposal).eq(proposalAddresses[2].address);
      expect(result[4].allocation).eq(parseEther('0.1'));
      expect(result[4].proposal).eq(proposalAddresses[6].address);
      expect(claimableRewards).eq(parseEther('0.058999991'));
    });

    it('Can change one allocation', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposal: proposalAddresses[0].address,
        },
      ]);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.2'),
          proposal: proposalAddresses[0].address,
        },
      ]);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      const claimableRewards = await allocationsStorage.getUserClaimableRewards(1, Alice.address);
      expect(allocation[0].allocation).eq(parseEther('0.2'));
      expect(allocation[0].proposal).eq(proposalAddresses[0].address);
      expect(claimableRewards).eq(parseEther('0.2'));
    });

    it('Can change to more allocations', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.1'), proposal: proposalAddresses[0].address },
        { allocation: parseEther('0.01'), proposal: proposalAddresses[1].address },
      ]);
      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.009'), proposal: proposalAddresses[3].address },
        { allocation: parseEther('0.00001'), proposal: proposalAddresses[4].address },
        { allocation: parseEther('0.2'), proposal: proposalAddresses[0].address },
      ]);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      const claimableRewards = await allocationsStorage.getUserClaimableRewards(1, Alice.address);
      expect(allocation).length(3);
      expect(allocation[0].allocation).eq(parseEther('0.009'));
      expect(allocation[0].proposal).eq(proposalAddresses[3].address);
      expect(allocation[1].allocation).eq(parseEther('0.00001'));
      expect(allocation[1].proposal).eq(proposalAddresses[4].address);
      expect(allocation[2].allocation).eq(parseEther('0.2'));
      expect(allocation[2].proposal).eq(proposalAddresses[0].address);
      expect(claimableRewards).eq(parseEther('0.19099'));
    });

    it('Can change to less allocations', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.009'), proposal: proposalAddresses[3].address },
        { allocation: parseEther('0.00001'), proposal: proposalAddresses[4].address },
        { allocation: parseEther('0.2'), proposal: proposalAddresses[0].address },
      ]);

      await allocations.connect(Alice).allocate([
        { allocation: parseEther('0.1'), proposal: proposalAddresses[0].address },
        { allocation: parseEther('0.01'), proposal: proposalAddresses[1].address },
      ]);

      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);
      const claimableRewards = await allocationsStorage.getUserClaimableRewards(1, Alice.address);
      expect(allocation).length(2);
      expect(allocation[0].allocation).eq(parseEther('0.1'));
      expect(allocation[0].proposal).eq(proposalAddresses[0].address);
      expect(allocation[1].allocation).eq(parseEther('0.01'));
      expect(allocation[1].proposal).eq(proposalAddresses[1].address);
      expect(claimableRewards).eq(parseEther('0.29'));
    });

    it('Multiple users can allocate', async () => {
      const {
        signers: { Alice, Bob, Charlie },
        proposalAddresses,
      } = testEnv;

      expect(await epochs.getCurrentEpoch()).eq(2);
      expect(await epochs.isDecisionWindowOpen()).eq(true);

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposal: proposalAddresses[0].address,
        },
      ]);
      await allocations.connect(Bob).allocate([
        { allocation: parseEther('0.13'), proposal: proposalAddresses[0].address },
        { allocation: parseEther('0.0002'), proposal: proposalAddresses[4].address },
      ]);
      await allocations.connect(Charlie).allocate([
        {
          allocation: parseEther('0.23'),
          proposal: proposalAddresses[4].address,
        },
      ]);
      const proposal1allocations = await allocationsStorage.getUsersWithTheirAllocations(
        1,
        proposalAddresses[0].address,
      );
      expect(proposal1allocations[0].length).eq(2);
      expect(proposal1allocations[1].length).eq(2);
      const proposal3allocations = await allocationsStorage.getUsersWithTheirAllocations(
        1,
        proposalAddresses[2].address,
      );
      expect(proposal3allocations[0].length).eq(0);
      expect(proposal3allocations[1].length).eq(0);
      const proposal5allocations = await allocationsStorage.getUsersWithTheirAllocations(
        1,
        proposalAddresses[4].address,
      );
      expect(proposal5allocations[0].length).eq(2);
      expect(proposal5allocations[1].length).eq(2);
    });

    it('User can change his proposal to allocate', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposal: proposalAddresses[0].address,
        },
      ]);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.234'),
          proposal: proposalAddresses[1].address,
        },
      ]);
      const allocation = await allocationsStorage.getUserAllocations(1, Alice.address);

      expect(allocation[0].proposal).eq(proposalAddresses[1].address);
    });

    it('Allocate emits Allocated event', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposal: proposalAddresses[0].address,
          },
        ]),
      ).emit(allocations, 'Allocated');
    });

    it('Allocate emits Claimed event', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposal: proposalAddresses[0].address,
          },
        ]),
      ).emit(allocations, 'Claimed');
    });
  });

  describe('Tests with controlled epochs setup (deposits faked)', async () => {
    it('Users allocate in second epoch', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const [epochs, allocations, allocationsStorage] = await setupAllocations(start, 500, 200);

      expect(await epochs.getCurrentEpoch()).eq(1);
      await forwardEpochs(epochs, 1);
      expect(await epochs.getCurrentEpoch()).eq(2);
      await allocations.connect(Alice).allocate([
        {
          allocation: parseEther('0.4'),
          proposal: proposalAddresses[0].address,
        },
      ]);
      const allocationInFirstEpoch = await allocationsStorage.getUserAllocations(1, Alice.address);
      const allocationInSecondEpoch = await allocationsStorage.getUserAllocations(2, Alice.address);

      expect(allocationInFirstEpoch[0].allocation).eq(parseEther('0.4'));
      expect(allocationInFirstEpoch[0].proposal).eq(proposalAddresses[0].address);
      expect(allocationInSecondEpoch.length).eq(0);
    });

    it('Cannot allocate when decision window closed', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const start = await getLatestBlockTimestamp();
      const [_, allocations] = await setupAllocations(start, 500, 200);

      await increaseNextBlockTimestamp(750);

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposal: proposalAddresses[0].address,
          },
        ]),
      ).revertedWith('HN:Allocations/decision-window-closed');
    });

    it('Cannot allocate when hexagon has not been started yet', async () => {
      const {
        signers: { Alice },
        proposalAddresses,
      } = testEnv;
      const [_, allocations] = await setupAllocations(2000000000, 500, 200);

      await expect(
        allocations.connect(Alice).allocate([
          {
            allocation: parseEther('0.4'),
            proposal: proposalAddresses[0].address,
          },
        ]),
      ).revertedWith('HN:Allocations/first-epoch-not-started-yet');
    });
  });
});
