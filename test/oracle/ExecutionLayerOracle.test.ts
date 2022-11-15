import { expect } from 'chai';
import { EXECUTION_LAYER_ORACLE } from '../../helpers/constants';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(EXECUTION_LAYER_ORACLE, (testEnv) => {

  describe('setBalance', async () => {
    it('Can set balance for given epoch', async () => {
      const { executionLayerOracle } = testEnv;
      await executionLayerOracle.setBalance(1, 100);
      expect(await executionLayerOracle.balanceByEpoch(1)).eq(100);
    });

    it('Cannot set balance for given epoch twice', async () => {
      const { executionLayerOracle } = testEnv;
      await executionLayerOracle.setBalance(1, 100);
      expect(executionLayerOracle.setBalance(1, 200))
        .revertedWith('HN/balance-for-given-epoch-already-exists');
    });

    it('Darth cannot set balance', async () => {
      const { executionLayerOracle, signers: { Darth } } = testEnv;
      expect(executionLayerOracle.connect(Darth).setBalance(1, 200))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
