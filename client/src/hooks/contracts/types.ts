import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export default interface UseContractParams {
  signerOrProvider?: Signer | Provider;
  tokenAddress?: string;
}
