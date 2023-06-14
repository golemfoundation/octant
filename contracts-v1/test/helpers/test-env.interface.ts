import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import {
  Auth,
  Deposits,
  Epochs,
  TestGLMFaucet,
  Token,
  Proposals,
  Vault,
  WithdrawalsTarget,
} from '../../typechain';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  auth: Auth;
  epochs: Epochs;
  faucet: TestGLMFaucet;
  glmDeposits: Deposits;
  proposalAddresses: SignerWithAddress[];
  proposals: Proposals;
  signers: Signers;
  target: WithdrawalsTarget;
  token: Token;
  vault: Vault;
}
