import { expect } from 'chai';
import { BEACON_CHAIN_ORACLE } from '../../helpers/constants';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(BEACON_CHAIN_ORACLE, (testEnv) => {

  describe('setBalance', async () => {
    it('Can set balance for given epoch', async () => {
      const { beaconChainOracle } = testEnv;
      await beaconChainOracle.setBalance(1, 100);
      expect(await beaconChainOracle.balanceByEpoch(1)).eq(100);
    });

    it('Cannot set balance for given epoch twice', async () => {
      const { beaconChainOracle } = testEnv;
      await beaconChainOracle.setBalance(1, 100);
      expect(beaconChainOracle.setBalance(1, 200)).revertedWith('HN/balance-for-given-epoch-already-exists');
    });

    it('Darth cannot set balance', async () => {
      const { beaconChainOracle, signers: { Darth } } = testEnv;
      expect(beaconChainOracle.connect(Darth).setBalance(1, 200))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
