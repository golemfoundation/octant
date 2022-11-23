import { expect } from 'chai';
import { EXECUTION_LAYER_ORACLE } from '../../helpers/constants';
import { forwardEpochs } from '../../helpers/epochs-utils';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(EXECUTION_LAYER_ORACLE, (testEnv) => {

  describe('setBalance', async () => {
    it('Can set balance for previous epoch', async () => {
      const { epochs, executionLayerOracle } = testEnv;
      await forwardEpochs(epochs, 1);
      await executionLayerOracle.setBalance(1, 100);
      expect(await executionLayerOracle.balanceByEpoch(1)).eq(100);
    });

    it('Cannot set balance for given epoch twice', async () => {
      const { epochs, executionLayerOracle } = testEnv;
      await forwardEpochs(epochs, 1);
      await executionLayerOracle.setBalance(1, 100);
      expect(executionLayerOracle.setBalance(1, 200))
        .revertedWith('HN/balance-for-given-epoch-already-exists');
    });

    it('Cannot set balance for future epoch', async () => {
      const { executionLayerOracle } = testEnv;
      expect(executionLayerOracle.setBalance(10, 200))
        .revertedWith('HN/can-set-balance-for-previous-epoch-only');
    });

    it('Cannot set balance for current epoch', async () => {
      const { executionLayerOracle } = testEnv;
      expect(executionLayerOracle.setBalance(1, 200))
        .revertedWith('HN/can-set-balance-for-previous-epoch-only');
    });

    it('Cannot set balance for epoch 0', async () => {
      const { executionLayerOracle } = testEnv;
      expect(executionLayerOracle.setBalance(0, 200))
        .revertedWith('HN/can-set-balance-for-previous-epoch-only');
    });

    it('Cannot set balance for epoch before previous epoch', async () => {
      const { epochs, executionLayerOracle } = testEnv;
      await forwardEpochs(epochs, 10);
      expect(executionLayerOracle.setBalance(5, 200))
        .revertedWith('HN/can-set-balance-for-previous-epoch-only');
    });

    it('Darth cannot set balance', async () => {
      const { executionLayerOracle, signers: { Darth } } = testEnv;
      expect(executionLayerOracle.connect(Darth).setBalance(1, 200))
        .revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('setValidatorAddress', async () => {
    it('Can set validator address', async () => {
      const { executionLayerOracle, signers: { Alice } } = testEnv;
      await executionLayerOracle.setValidatorAddress(Alice.address);
      expect(await executionLayerOracle.validatorAddress()).eq(Alice.address);
    });

    it('Darth cannot set validator`s indexes', async () => {
      const { executionLayerOracle, signers: { Darth } } = testEnv;
      expect(executionLayerOracle.connect(Darth).setValidatorAddress(Darth.address))
        .revertedWith('Ownable: caller is not the owner');
    });
  });
});
