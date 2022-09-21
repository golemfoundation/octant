import { Proposals, Deposits } from '../../typechain-types';
import { ethers } from 'hardhat';

export type Signers = {[name: string]: string};

export interface TestEnv {
	esigners: Array<ethers.Signer>;
  signers: Signers;
  proposals: Proposals;
	glmd: Deposits;
}
