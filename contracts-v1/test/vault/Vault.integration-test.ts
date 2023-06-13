import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';


import { merkleTreeData } from './vaultTestParameters';

import { VAULT } from '../../helpers/constants';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(VAULT, testEnv => {
  describe('Vault integration tests', () => {
    it('All users can withdraw based on merkle tree build on backend', async () => {
      const {
        vault,
        signers: { TestFoundation },
      } = testEnv;
      const signers = await ethers.getSigners();
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('10') });

      // set merkle roots
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTreeData[0].merkleRoot);
      await vault.connect(TestFoundation).setMerkleRoot(2, merkleTreeData[1].merkleRoot);

      for (let i = 0; i < signers.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const before = await ethers.provider.getBalance(signers[i].address);

        // construct payloads
        const payloads = [
          merkleTreeData[0].withdrawPayloads[i],
          merkleTreeData[1].withdrawPayloads[i],
        ];
        // eslint-disable-next-line no-await-in-loop
        await vault.connect(signers[i]).batchWithdraw(payloads);

        // eslint-disable-next-line no-await-in-loop
        const after = await ethers.provider.getBalance(signers[i].address);

        // check if the proper amount was paid out
        const withdrewAmount = BigNumber.from(merkleTreeData[0].withdrawPayloads[i].amount).add(
          BigNumber.from(merkleTreeData[1].withdrawPayloads[i].amount),
        );
        expect(after).approximately(before.add(withdrewAmount), parseEther('0.001'));
      }
    });
  });
});
