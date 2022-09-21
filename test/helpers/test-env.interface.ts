import { Proposals } from '../../typechain-types';

export type Signers = {[name: string]: string};

export interface TestEnv {
  signers: Signers;
  proposals: Proposals;
}
