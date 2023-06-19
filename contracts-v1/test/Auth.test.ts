import { expect } from 'chai';

import { makeTestsEnv } from './helpers/make-tests-env';

import { AUTH, ZERO_ADDRESS } from '../helpers/constants';

makeTestsEnv(AUTH, testEnv => {
  describe('constructor', () => {
    it('should set the deployer and multisig addresses', async () => {
      const {
        auth,
        signers: { TestFoundation },
      } = testEnv;
      expect(await auth.multisig()).to.eq(TestFoundation.address);
    });
  });

  describe('transferOwnership', () => {
    it('should not change ownership without second step', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice },
      } = testEnv;
      await auth.connect(TestFoundation).transferOwnership(Alice.address);
      expect(await auth.multisig()).to.eq(TestFoundation.address);
      expect(await auth.pendingOwner()).to.eq(Alice.address);
    });

    it('can be called multiple times', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice, Bob },
      } = testEnv;
      await auth.connect(TestFoundation).transferOwnership(Alice.address);
      await auth.connect(TestFoundation).transferOwnership(Bob.address);
      expect(await auth.pendingOwner()).to.eq(Bob.address);
    });

    it('should emit OwnershipTransferStarted event', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice },
      } = testEnv;
      await expect(auth.connect(TestFoundation).transferOwnership(Alice.address))
        .to.emit(auth, 'OwnershipTransferStarted')
        .withArgs(TestFoundation.address, Alice.address);
    });

    it('should revert if called by an unauthorized caller', async () => {
      const {
        auth,
        signers: { Darth },
      } = testEnv;
      await expect(auth.connect(Darth).transferOwnership(Darth.address)).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });
  });

  describe('acceptOwnership', () => {
    it('called by newOwner should transfer ownership', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice },
      } = testEnv;
      expect(await auth.multisig()).to.eq(TestFoundation.address);
      await auth.connect(TestFoundation).transferOwnership(Alice.address);
      await auth.connect(Alice).acceptOwnership();
      expect(await auth.multisig()).to.eq(Alice.address);
      expect(await auth.pendingOwner()).to.eq(ZERO_ADDRESS);
    });

    it('called outside of transfer process should fail', async () => {
      const {
        auth,
        signers: { Alice },
      } = testEnv;
      await expect(auth.connect(Alice).acceptOwnership()).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });

    it('called by unauthorized party, should fail', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice, Darth },
      } = testEnv;
      await auth.connect(TestFoundation).transferOwnership(Alice.address);
      await expect(auth.connect(Darth).acceptOwnership()).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });

    it('called by newOwner second time, should fail', async () => {
      const {
        auth,
        signers: { TestFoundation, Alice },
      } = testEnv;
      await auth.connect(TestFoundation).transferOwnership(Alice.address);
      await auth.connect(Alice).acceptOwnership();
      await expect(auth.connect(Alice).acceptOwnership()).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });
  });
});
