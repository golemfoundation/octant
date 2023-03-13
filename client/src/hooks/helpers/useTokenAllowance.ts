import { BigNumber } from 'ethers';

import { ERC20 } from '../../typechain-types';

export default function useTokenAllowance(
  contract: ERC20,
  signerAddress: string,
  spender: string,
): Promise<BigNumber> {
  return contract.allowance(signerAddress, spender);
}
