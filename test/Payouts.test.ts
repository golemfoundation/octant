import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { GOLEM_FOUNDATION_MULTISIG } from '../env';
import { PAYOUTS, PAYOUTS_MANAGER } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { Payouts, PayoutsManager, Rewards } from '../typechain-types';


makeTestsEnv(PAYOUTS, testEnv => {
  let rewards: FakeContract<Rewards>;
  let payouts: Payouts;
  let payoutsManager: PayoutsManager;

  beforeEach(async () => {
    const {
      epochs,
      signers: { Alice },
    } = testEnv;

    // configure rewards in a simpler way
    rewards = await smock.fake<Rewards>('Rewards');
    const payoutsFactory = await ethers.getContractFactory(PAYOUTS);
    payouts = (await payoutsFactory.deploy(rewards.address, epochs.address)) as Payouts;
    const payoutsManagerFactory = await ethers.getContractFactory(PAYOUTS_MANAGER);
    payoutsManager = (await payoutsManagerFactory.deploy(
      payouts.address,
      GOLEM_FOUNDATION_MULTISIG,
    )) as PayoutsManager;
    await payouts.setPayoutsManager(payoutsManager.address);

    // provide spendable income
    await Alice.sendTransaction({ to: payoutsManager.address, value: parseEther('3') });
    await forwardEpochs(epochs, 2);
  });

  describe('User payouts', async () => {
    beforeEach(async () => {
      rewards.claimableReward.returns((_epoch: number, _user: string) => {
        switch (_epoch) {
          case 1:
            return parseEther('1.0');
          case 2:
            return parseEther('1.0');
          default:
            return parseEther('1.0');
        }
      });
    });

    it('check if rewards contract is called once', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawUser(parseEther('0.3'));
      expect(rewards.claimableReward).calledOnce;
      rewards.claimableReward.atCall(0).calledWith(1, Alice.address);
    });

    it('check if rewards contract is called twice', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawUser(parseEther('2.0'));
      expect(rewards.claimableReward).calledTwice;
      rewards.claimableReward.atCall(0).calledWith(1, Alice.address);
      rewards.claimableReward.atCall(1).calledWith(2, Alice.address);
    });

    it("can't register more than earned", async () => {
      const {
        signers: { Alice },
      } = testEnv;
      // user gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(payoutsManager.connect(Alice).withdrawUser(parseEther('3.1'))).to.be.revertedWith(
        'HN:Payouts/registering-withdrawal-of-unearned-funds',
      );
    });

    it('payout stay permanent if registration is reverted', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawUser(parseEther('0.3'));
      let alicePayout = await payouts.payoutStatus(Alice.address);
      expect(alicePayout.total).eq(parseEther('0.3'));
      expect(alicePayout.checkpointEpoch).eq(0);

      // user gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(payoutsManager.connect(Alice).withdrawUser(parseEther('2.8'))).to.be.revertedWith(
        'HN:Payouts/registering-withdrawal-of-unearned-funds',
      );

      alicePayout = await payouts.payoutStatus(Alice.address);
      expect(alicePayout.total).eq(parseEther('0.3'));
      expect(alicePayout.extra).eq(parseEther('0.3'));
    });

    it('multiple registrations add up; checkpoint grows; extra is taken into account', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawUser(parseEther('0.3'));
      let alicePayout = await payouts.payoutStatus(Alice.address);
      expect(alicePayout.total).eq(parseEther('0.3'));
      expect(alicePayout.extra).eq(parseEther('0.3'));

      await payoutsManager.connect(Alice).withdrawUser(parseEther('0.8'));
      alicePayout = await payouts.payoutStatus(Alice.address);
      expect(alicePayout.total).eq(parseEther('1.1'));
      expect(alicePayout.extra).eq(parseEther('0.1'));
      expect(alicePayout.checkpointEpoch).eq(1);
    });
  });

  describe('Proposal payouts', async () => {
    beforeEach(async () => {
      rewards.proposalReward.returns((_epoch: number, _proposal: string) => {
        switch (_epoch) {
          case 1:
            return parseEther('1.0');
          case 2:
            return parseEther('1.0');
          default:
            return parseEther('1.0');
        }
      });
    });

    it('check if rewards contract is called once', async () => {
      const {
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      await payoutsManager
        .connect(Alice)
        .withdrawProposal(proposalAddresses[0].address, parseEther('0.3'));
      expect(rewards.proposalReward).calledOnce;
      rewards.proposalReward.atCall(0).calledWith(1, 1);
    });

    it('check if rewards contract is called twice', async () => {
      const {
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      await payoutsManager
        .connect(Alice)
        .withdrawProposal(proposalAddresses[0].address, parseEther('2.0'));
      expect(rewards.proposalReward).calledTwice;
      rewards.proposalReward.atCall(0).calledWith(1, 1);
      rewards.proposalReward.atCall(1).calledWith(2, 1);
    });

    it("can't register more than earned", async () => {
      const {
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      // proposal gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(
        payoutsManager
          .connect(Alice)
          .withdrawProposal(proposalAddresses[0].address, parseEther('3.1')),
      ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');
    });

    it('payout stay permanent if registration is reverted', async () => {
      const {
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      await payoutsManager
        .connect(Alice)
        .withdrawProposal(proposalAddresses[0].address, parseEther('0.3'));
      let proposalPayout = await payouts.payoutStatus(proposalAddresses[0].address);
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.checkpointEpoch).eq(0);

      // proposal gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(
        payoutsManager
          .connect(Alice)
          .withdrawProposal(proposalAddresses[0].address, parseEther('2.8')),
      ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');

      proposalPayout = await payouts.payoutStatus(proposalAddresses[0].address);
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.extra).eq(parseEther('0.3'));
    });

    it('multiple registrations add up; checkpoint grows; extra is taken into account', async () => {
      const {
        proposalAddresses,
        signers: { Alice },
      } = testEnv;
      await payoutsManager
        .connect(Alice)
        .withdrawProposal(proposalAddresses[0].address, parseEther('0.3'));
      let proposalPayout = await payouts.payoutStatus(proposalAddresses[0].address);
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.extra).eq(parseEther('0.3'));

      await payoutsManager
        .connect(Alice)
        .withdrawProposal(proposalAddresses[0].address, parseEther('0.8'));
      proposalPayout = await payouts.payoutStatus(proposalAddresses[0].address);
      expect(proposalPayout.total).eq(parseEther('1.1'));
      expect(proposalPayout.extra).eq(parseEther('0.1'));
      expect(proposalPayout.checkpointEpoch).eq(1);
    });
  });

  describe('Golem Foundation payouts', async () => {
    beforeEach(async () => {
      rewards.golemFoundationReward.returns((_epoch: number) => {
        switch (_epoch) {
          case 1:
            return parseEther('1.0');
          case 2:
            return parseEther('1.0');
          default:
            return parseEther('1.0');
        }
      });
    });

    it('check if rewards contract is called once', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('0.3'));
      expect(rewards.golemFoundationReward).calledOnce;
      rewards.golemFoundationReward.atCall(0).calledWith(1, 1);
    });

    it('check if rewards contract is called twice', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('2.0'));
      expect(rewards.golemFoundationReward).calledTwice;
      rewards.golemFoundationReward.atCall(0).calledWith(1, 1);
      rewards.golemFoundationReward.atCall(1).calledWith(2, 1);
    });

    it("can't register more than earned", async () => {
      const {
        signers: { Alice },
      } = testEnv;
      // proposal gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(
        payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('3.1')),
      ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');
    });

    it('payout stay permanent if registration is reverted', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('0.3'));
      let proposalPayout = await payouts.payoutStatus(
        payoutsManager.golemFoundationWithdrawalAddress(),
      );
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.checkpointEpoch).eq(0);

      // proposal gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
      expect(
        payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('2.8')),
      ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');

      proposalPayout = await payouts.payoutStatus(
        payoutsManager.golemFoundationWithdrawalAddress(),
      );
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.extra).eq(parseEther('0.3'));
    });

    it('multiple registrations add up; checkpoint grows; extra is taken into account', async () => {
      const {
        signers: { Alice },
      } = testEnv;
      await payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('0.3'));
      let proposalPayout = await payouts.payoutStatus(
        payoutsManager.golemFoundationWithdrawalAddress(),
      );
      expect(proposalPayout.total).eq(parseEther('0.3'));
      expect(proposalPayout.extra).eq(parseEther('0.3'));

      await payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('0.8'));
      proposalPayout = await payouts.payoutStatus(
        payoutsManager.golemFoundationWithdrawalAddress(),
      );
      expect(proposalPayout.total).eq(parseEther('1.1'));
      expect(proposalPayout.extra).eq(parseEther('0.1'));
      expect(proposalPayout.checkpointEpoch).eq(1);
    });
  });

  it('Tx for unknown payee type is reverted', async () => {
    const {
      signers: { Alice },
    } = testEnv;
    expect(payoutsManager.connect(Alice).withdrawGolemFoundation(parseEther('2.8'))).to.be.reverted;
  });
});
