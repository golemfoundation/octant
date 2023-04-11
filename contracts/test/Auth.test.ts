import { expect } from 'chai';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { DEPOSITS } from '../helpers/constants';


makeTestsEnv(DEPOSITS, testEnv => {
  describe('Auth', () => {
    describe('constructor', () => {
      it('should set the deployer and multisig addresses', async () => {
        const {
          auth,
          signers: { deployer, TestFoundation },
        } = testEnv;
        expect(await auth.deployer()).to.eq(await deployer.getAddress());
        expect(await auth.multisig()).to.eq(await TestFoundation.getAddress());
      });
    });

    describe('setMultisig', () => {
      it('should set the new multisig address', async () => {
        const {
          auth,
          signers: { TestFoundation, Alice },
        } = testEnv;
        await auth.connect(TestFoundation).setMultisig(Alice.address);
        expect(await auth.multisig()).to.eq(Alice.address);
      });

      it('should emit MultisigSet event', async () => {
        const {
          auth,
          signers: { TestFoundation, Alice },
        } = testEnv;
        await expect(auth.connect(TestFoundation).setMultisig(Alice.address))
          .to.emit(auth, 'MultisigSet')
          .withArgs(TestFoundation.address, Alice.address);
      });

      it('should revert if called by an unauthorized caller', async () => {
        const {
          auth,
          signers: { Darth },
        } = testEnv;
        await expect(auth.connect(Darth).setMultisig(Darth.address)).to.be.revertedWith(
          'HN:Common/unauthorized-caller',
        );
      });
    });

    describe('renounceDeployer', () => {
      it('should set the deployer address to zero', async () => {
        const {
          auth,
          signers: { deployer },
        } = testEnv;
        await auth.connect(deployer).renounceDeployer();
        expect(await auth.deployer()).to.eq(ethers.constants.AddressZero);
      });

      it('should emit DeployerRenounced event', async () => {
        const {
          auth,
          signers: { deployer },
        } = testEnv;
        await expect(auth.connect(deployer).renounceDeployer())
          .to.emit(auth, 'DeployerRenounced')
          .withArgs(deployer.address);
      });

      it('should revert if called by a non-deployer', async () => {
        const {
          auth,
          signers: { Darth },
        } = testEnv;
        await expect(auth.connect(Darth).renounceDeployer()).to.be.revertedWith(
          'HN:Common/unauthorized-caller',
        );
      });
    });
  });
});
