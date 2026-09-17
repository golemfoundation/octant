import { Hash } from 'viem';

import env from 'env';

import Deposits from './abi/Deposits.json';
import ERC20 from './abi/ERC20.json';
import RegenStaker from './abi/RegenStaker.json';
import Vault from './abi/Vault.json';

type WriteContract = {
  args: unknown[];
  functionName: string;
  // Should be typed as UseWalletClientReturnType, but methods are not visible.
  walletClient: any; // UseWalletClientReturnType<any, any, any>;
};

/**
 * Reason carried by {@link walletNotAvailableError}. Mapped to a user-facing
 * message in `api/errorMessages`.
 */
export const WALLET_NOT_AVAILABLE_REASON = 'wallet/not-available';

/**
 * Error surfaced when the wagmi wallet client is unavailable (wallet
 * disconnected / locked / on an unsupported network). It carries a `reason` so
 * the global error handler shows an actionable message instead of the generic
 * "something went wrong" toast or an opaque "cannot read properties of
 * undefined" TypeError.
 */
export function walletNotAvailableError(): Error {
  return Object.assign(new Error('Wallet client is not available'), {
    reason: WALLET_NOT_AVAILABLE_REASON,
  });
}

/**
 * Narrows the wagmi wallet client to a defined value, throwing a mapped error
 * when it is missing instead of letting `walletClient!.writeContract` blow up.
 */
export function assertWalletClient<T>(walletClient: T | undefined | null): NonNullable<T> {
  if (!walletClient) {
    throw walletNotAvailableError();
  }
  return walletClient as NonNullable<T>;
}

export function writeContractERC20({
  walletClient,
  functionName,
  args,
}: WriteContract): Promise<Hash> {
  return walletClient.writeContract({
    abi: ERC20.abi,
    address: env.contractGlmAddress as Hash,
    args,
    functionName,
  });
}

export function writeContractDeposits({
  walletClient,
  functionName,
  args,
}: WriteContract): Promise<Hash> {
  return walletClient.writeContract({
    abi: Deposits.abi,
    address: env.contractDepositsAddress as Hash,
    args,
    functionName,
  });
}

export function writeContractVault({
  walletClient,
  functionName,
  args,
}: WriteContract): Promise<Hash> {
  return walletClient.writeContract({
    abi: Vault.abi,
    address: env.contractVaultAddress as Hash,
    args,
    functionName,
  });
}

export function writeContractRegenStaker({
  walletClient,
  functionName,
  args,
}: WriteContract): Promise<Hash> {
  return walletClient.writeContract({
    abi: RegenStaker.abi,
    address: env.contractRegenStakerAddress as Hash,
    args,
    functionName,
  });
}
