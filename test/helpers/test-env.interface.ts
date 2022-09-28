import { Deposits, Proposals, Token } from '../../typechain-types';
import { ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

export type Role = "deployer" | "user" | "hacker";
export type Signers = Record<Role, SignerWithAddress>;

export interface TestEnv {
  signers: Signers;
  proposals: Proposals;
  glmDeposits: Deposits;
  token: Token;
}
