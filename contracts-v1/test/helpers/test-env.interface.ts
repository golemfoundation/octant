import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import { Auth, Deposits, TestGLMFaucet, Token } from '../../typechain';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  auth: Auth;
  faucet: TestGLMFaucet;
  glmDeposits: Deposits;
  signers: Signers;
  token: Token;
}
