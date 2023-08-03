import { ContractContext as ERC20Contract } from 'hooks/contracts/typings/ERC20';

export default function useTokenAllowance(
  contract: ERC20Contract,
  signerAddress: string,
  spender: string,
): Promise<BigInt> {
  return contract.methods.allowance(signerAddress, spender).call();
}
