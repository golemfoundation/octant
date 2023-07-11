import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { VAULT } from '../../helpers/constants';
import Leaf, { buildMerkleTree, getProof } from '../../helpers/merkle-tree';
import { makeTestsEnv } from '../helpers/make-tests-env';

makeTestsEnv(VAULT, testEnv => {
  describe('setMerkleRoot', () => {
    it('Only multisig can set merkle root', async () => {
      const {
        vault,
        signers: { Darth },
      } = testEnv;

      // Darth can't set merkle root
      await expect(
        vault
          .connect(Darth)
          .setMerkleRoot(1, '0x0000000000000000000000000000000000000000000000000000000000000001'),
      ).to.be.revertedWith('HN:Common/unauthorized-caller');
    });

    it('Merkle root cannot be set twice for the epoch', async () => {
      const {
        vault,
        signers: { TestFoundation },
      } = testEnv;

      await vault
        .connect(TestFoundation)
        .setMerkleRoot(1, '0x2c16c5739ec31a951e5551e828ef57ee2d6944b36cf674db9f884173289c7946');
      await expect(
        vault
          .connect(TestFoundation)
          .setMerkleRoot(1, '0xae358f6ef71c4eaa96cbb68b6e8e304c2348cce8f53424409a5bd76f29d357f3'),
      ).to.be.revertedWith('HN:Vault/merkle-root-already-set');
    });

    it('Cannot set invalid merkle root', async () => {
      const {
        vault,
        signers: { TestFoundation },
      } = testEnv;
      const invalidMerkleRoot =
        '0x0000000000000000000000000000000000000000000000000000000000000000';

      await expect(
        vault.connect(TestFoundation).setMerkleRoot(1, invalidMerkleRoot),
      ).to.revertedWith('HN:Vault/invalid-merkle-root');
    });

    it('Can set merkle roots', async () => {
      const {
        vault,
        signers: { TestFoundation },
      } = testEnv;
      const merkleRoot1 = '0x2c16c5739ec31a951e5551e828ef57ee2d6944b36cf674db9f884173289c7946';
      const merkleRoot2 = '0xae358f6ef71c4eaa96cbb68b6e8e304c2348cce8f53424409a5bd76f29d357f3';

      await vault.connect(TestFoundation).setMerkleRoot(1, merkleRoot1);
      expect(await vault.merkleRoots(1)).eq(merkleRoot1);

      await vault.connect(TestFoundation).setMerkleRoot(2, merkleRoot2);
      expect(await vault.merkleRoots(2)).eq(merkleRoot2);
    });
  });

  describe('emergencyWithdraw', async () => {
    it('Multisig can make emergency withdraw', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(TestFoundation.address);
      // vault has some funds
      await Alice.sendTransaction({ to: vault.address, value: parseEther('10') });

      await vault.connect(TestFoundation).emergencyWithdraw(parseEther('10'));

      expect(await ethers.provider.getBalance(TestFoundation.address)).approximately(
        before.add(parseEther('10')),
        parseEther('0.001'),
      );
    });

    it('Emergency withdraw by unauthorized user is reverted', async () => {
      const {
        vault,
        signers: { Darth },
      } = testEnv;
      await expect(vault.connect(Darth).emergencyWithdraw(parseEther('1'))).to.be.revertedWith(
        'HN:Common/unauthorized-caller',
      );
    });

    it('Should revert with failed-to-send message if contract does not have enough ETH', async () => {
      const {
        vault,
        signers: { TestFoundation },
      } = testEnv;

      // This should fail because contract has 0 ETH
      await expect(vault.connect(TestFoundation).emergencyWithdraw(1)).to.be.revertedWith(
        'HN:Common/failed-to-send',
      );
    });
  });

  describe('withdraw (single and batch)', async () => {
    let merkleTree1: StandardMerkleTree<string[]>;
    let merkleTree2: StandardMerkleTree<string[]>;
    let merkleTree3: StandardMerkleTree<string[]>;

    beforeEach(async () => {
      const {
        signers: { Alice, Bob, Charlie, Eve },
      } = testEnv;
      const leaves1: Leaf[] = [
        {
          address: Alice.address,
          amount: parseEther('10'),
        },
        {
          address: Bob.address,
          amount: parseEther('5'),
        },
      ];
      merkleTree1 = buildMerkleTree(leaves1);

      const leaves2: Leaf[] = [
        {
          address: Bob.address,
          amount: parseEther('7'),
        },
        {
          address: Charlie.address,
          amount: parseEther('14'),
        },
      ];
      merkleTree2 = buildMerkleTree(leaves2);

      const leaves3: Leaf[] = [
        {
          address: Alice.address,
          amount: parseEther('0.5'),
        },
        {
          address: Bob.address,
          amount: parseEther('0.3'),
        },
        {
          address: Eve.address,
          amount: parseEther('11'),
        },
      ];
      merkleTree3 = buildMerkleTree(leaves3);
    });

    it('User cannot withdraw with fake proof', async () => {
      const {
        vault,
        signers: { Alice, Darth },
      } = testEnv;
      const before = await ethers.provider.getBalance(Darth.address);
      // vault has some funds
      await Alice.sendTransaction({ to: vault.address, value: parseEther('10') });
      const payload = {
        amount: parseEther('10'),
        epoch: 1,
        proof: ['0x0000000000000000000000000000000000000000000000000000000000000001'],
      };

      await expect(vault.connect(Darth).batchWithdraw([payload])).to.be.revertedWith(
        'HN:Vault/invalid-merkle-proof',
      );

      expect(await ethers.provider.getBalance(Darth.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('User cannot withdraw more than owns', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('10') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      const aliceProof = getProof(merkleTree1, Alice.address);
      const payload = {
        amount: parseEther('12'),
        epoch: 1,
        proof: aliceProof,
      };

      await expect(vault.connect(Alice).batchWithdraw([payload])).to.be.revertedWith(
        'HN:Vault/invalid-merkle-proof',
      );

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('User cannot withdraw twice from the same epoch', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('20') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      const aliceProof = getProof(merkleTree1, Alice.address);
      const payload = {
        amount: parseEther('10'),
        epoch: 1,
        proof: aliceProof,
      };

      await vault.connect(Alice).batchWithdraw([payload]);
      await expect(vault.connect(Alice).batchWithdraw([payload])).to.be.revertedWith(
        'HN:Vault/already-claimed',
      );

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before.add(parseEther('10')),
        parseEther('0.001'),
      );
    });

    it('Should revert with failed-to-send message if contract does not have enough ETH', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('1') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      const aliceProof = getProof(merkleTree1, Alice.address);
      const payload = {
        amount: parseEther('10'),
        epoch: 1,
        proof: aliceProof,
      };

      await expect(vault.connect(Alice).batchWithdraw([payload])).revertedWith(
        'HN:Common/failed-to-send',
      );
      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('User cannot withdraw twice from the same epoch in batch', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('20') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      const aliceProof = getProof(merkleTree1, Alice.address);
      const payload1 = {
        amount: parseEther('10'),
        epoch: 1,
        proof: aliceProof,
      };
      const payload2 = {
        amount: parseEther('10'),
        epoch: 1,
        proof: aliceProof,
      };

      await expect(vault.connect(Alice).batchWithdraw([payload1, payload2])).to.be.revertedWith(
        'HN:Vault/already-claimed',
      );

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('User cannot withdraw from the epoch he does not have rewards', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('20') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      await vault.connect(TestFoundation).setMerkleRoot(2, merkleTree2.root);
      const aliceProof = getProof(merkleTree1, Alice.address);
      const payload = {
        amount: parseEther('10'),
        epoch: 2,
        proof: aliceProof,
      };

      await expect(vault.connect(Alice).batchWithdraw([payload])).to.be.revertedWith(
        'HN:Vault/invalid-merkle-proof',
      );

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('Cannot send empty payloads', async () => {
      const {
        vault,
        signers: { Alice, TestFoundation },
      } = testEnv;
      const before = await ethers.provider.getBalance(Alice.address);
      // vault has some funds
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('20') });
      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);

      await expect(vault.connect(Alice).batchWithdraw([])).to.be.revertedWith(
        'HN:Vault/empty-payloads',
      );

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        before,
        parseEther('0.001'),
      );
    });

    it('Users can make a withdraw from a single epoch', async () => {
      const {
        vault,
        signers: { Alice, Bob, TestFoundation },
      } = testEnv;

      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      await TestFoundation.sendTransaction({ to: vault.address, value: parseEther('15') });

      const aliceBefore = await ethers.provider.getBalance(Alice.address);
      const bobBefore = await ethers.provider.getBalance(Bob.address);

      // Alice withdrew
      const aliceProof = getProof(merkleTree1, Alice.address);
      await vault.connect(Alice).batchWithdraw([
        {
          amount: parseEther('10'),
          epoch: 1,
          proof: aliceProof,
        },
      ]);

      // Bob withdrew
      const bobProof = getProof(merkleTree1, Bob.address);
      await vault.connect(Bob).batchWithdraw([
        {
          amount: parseEther('5'),
          epoch: 1,
          proof: bobProof,
        },
      ]);

      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        aliceBefore.add(parseEther('10')),
        parseEther('0.001'),
      );
      expect(await ethers.provider.getBalance(Bob.address)).approximately(
        bobBefore.add(parseEther('5')),
        parseEther('0.001'),
      );
      expect(await vault.lastClaimedEpoch(Bob.address)).eq(1);
      expect(await vault.lastClaimedEpoch(Alice.address)).eq(1);
    });

    it('Users can withdraw in batches', async () => {
      const {
        vault,
        signers: { Alice, Bob, Charlie, Eve, TestFoundation },
      } = testEnv;
      const vaultBalance = parseEther('50');

      await vault.connect(TestFoundation).setMerkleRoot(1, merkleTree1.root);
      await vault.connect(TestFoundation).setMerkleRoot(2, merkleTree2.root);
      await vault.connect(TestFoundation).setMerkleRoot(3, merkleTree3.root);
      await TestFoundation.sendTransaction({ to: vault.address, value: vaultBalance });

      const aliceBefore = await ethers.provider.getBalance(Alice.address);
      const bobBefore = await ethers.provider.getBalance(Bob.address);
      const charlieBefore = await ethers.provider.getBalance(Charlie.address);
      const eveBefore = await ethers.provider.getBalance(Eve.address);

      // Alice withdrew
      const alicePayload1 = {
        amount: parseEther('10'),
        epoch: 1,
        proof: getProof(merkleTree1, Alice.address),
      };
      const alicePayload2 = {
        amount: parseEther('0.5'),
        epoch: 3,
        proof: getProof(merkleTree3, Alice.address),
      };
      await vault.connect(Alice).batchWithdraw([alicePayload1, alicePayload2]);

      // Bob withdrew
      const bobPayload1 = {
        amount: parseEther('5'),
        epoch: 1,
        proof: getProof(merkleTree1, Bob.address),
      };
      const bobPayload2 = {
        amount: parseEther('7'),
        epoch: 2,
        proof: getProof(merkleTree2, Bob.address),
      };
      const bobPayload3 = {
        amount: parseEther('0.3'),
        epoch: 3,
        proof: getProof(merkleTree3, Bob.address),
      };
      await vault.connect(Bob).batchWithdraw([bobPayload1, bobPayload2, bobPayload3]);

      // Charlie withdrew
      const charliePayload1 = {
        amount: parseEther('14'),
        epoch: 2,
        proof: getProof(merkleTree2, Charlie.address),
      };
      await vault.connect(Charlie).batchWithdraw([charliePayload1]);

      // Eve withdrew
      const evePayload1 = {
        amount: parseEther('11'),
        epoch: 3,
        proof: getProof(merkleTree3, Eve.address),
      };
      await vault.connect(Eve).batchWithdraw([evePayload1]);

      // Check Alice
      expect(await ethers.provider.getBalance(Alice.address)).approximately(
        aliceBefore.add(parseEther('10.5')),
        parseEther('0.001'),
      );
      expect(await vault.lastClaimedEpoch(Alice.address)).eq(3);

      // Check Bob
      expect(await ethers.provider.getBalance(Bob.address)).approximately(
        bobBefore.add(parseEther('12.3')),
        parseEther('0.001'),
      );
      expect(await vault.lastClaimedEpoch(Bob.address)).eq(3);

      // Check Charlie
      expect(await ethers.provider.getBalance(Charlie.address)).approximately(
        charlieBefore.add(parseEther('14')),
        parseEther('0.001'),
      );
      expect(await vault.lastClaimedEpoch(Charlie.address)).eq(2);

      // Check Eve
      expect(await ethers.provider.getBalance(Eve.address)).approximately(
        eveBefore.add(parseEther('11')),
        parseEther('0.001'),
      );
      expect(await vault.lastClaimedEpoch(Eve.address)).eq(3);

      // Check Vault balance
      expect(await ethers.provider.getBalance(vault.address)).approximately(
        vaultBalance
          .sub(parseEther('11'))
          .sub(parseEther('14'))
          .sub(parseEther('12.3'))
          .sub(parseEther('10.5')),
        parseEther('0.001'),
      );
    });
  });
});
