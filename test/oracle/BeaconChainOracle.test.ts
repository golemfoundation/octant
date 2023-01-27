import { expect } from 'chai';

import { BEACON_CHAIN_ORACLE } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(BEACON_CHAIN_ORACLE, testEnv => {
  describe('setBalance', async () => {
    it('Can set balance for previous epoch', async () => {
      const { epochs, beaconChainOracle } = testEnv;
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(1, 100);
      expect(await beaconChainOracle.balanceByEpoch(1)).eq(100);
    });

    it('Cannot set balance for given epoch twice', async () => {
      const { epochs, beaconChainOracle } = testEnv;
      await forwardEpochs(epochs, 1);
      await beaconChainOracle.setBalance(1, 100);
      expect(beaconChainOracle.setBalance(1, 200)).revertedWith(
        'HN:Oracle/balance-for-given-epoch-already-exists',
      );
    });

    it('Cannot set balance for future epoch', async () => {
      const { beaconChainOracle } = testEnv;
      expect(beaconChainOracle.setBalance(10, 200)).revertedWith(
        'HN:Oracle/can-set-balance-for-previous-epoch-only',
      );
    });

    it('Cannot set balance for current epoch', async () => {
      const { beaconChainOracle } = testEnv;
      expect(beaconChainOracle.setBalance(1, 200)).revertedWith(
        'HN:Oracle/can-set-balance-for-previous-epoch-only',
      );
    });

    it('Cannot set balance for epoch 0', async () => {
      const { beaconChainOracle } = testEnv;
      expect(beaconChainOracle.setBalance(0, 200)).revertedWith(
        'HN:Oracle/can-set-balance-for-previous-epoch-only',
      );
    });

    it('Cannot set balance for epoch before previous epoch', async () => {
      const { epochs, beaconChainOracle } = testEnv;
      await forwardEpochs(epochs, 10);
      expect(beaconChainOracle.setBalance(5, 200)).revertedWith(
        'HN:Oracle/can-set-balance-for-previous-epoch-only',
      );
    });

    it('Darth cannot set balance', async () => {
      const {
        beaconChainOracle,
        signers: { Darth },
      } = testEnv;
      expect(beaconChainOracle.connect(Darth).setBalance(1, 200)).revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });

  describe('setValidatorIndexes', async () => {
    it('Can set validator indexes', async () => {
      const { beaconChainOracle } = testEnv;
      await beaconChainOracle.setValidatorIndexes('1,2,3,4,5');
      expect(await beaconChainOracle.validatorIndexes()).eq('1,2,3,4,5');
    });

    it('Darth cannot set validator`s indexes', async () => {
      const {
        beaconChainOracle,
        signers: { Darth },
      } = testEnv;
      expect(beaconChainOracle.connect(Darth).setValidatorIndexes('1,2,3,4,5')).revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });
});
