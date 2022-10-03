import { Allocations, Deposits, Proposals, Token } from '../../typechain-types';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  signers: Signers;
  allocations: Allocations;
  proposals: Proposals;
  glmDeposits: Deposits;
  token: Token;
}
