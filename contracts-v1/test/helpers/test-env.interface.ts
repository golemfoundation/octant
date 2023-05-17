import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import { Auth, Deposits, Epochs, TestGLMFaucet, Token } from '../../typechain';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  auth: Auth;
  epochs: Epochs;
  faucet: TestGLMFaucet;
  glmDeposits: Deposits;
  signers: Signers;
  token: Token;
}
