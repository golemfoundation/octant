import { Buffer } from 'buffer';

// Reason for it: https://github.com/WalletConnect/web3modal/issues/1192#issue-1800868902
if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
  if (!window.global) {
    window.global = window;
  }
  if (!window.process) {
    // @ts-expect-error this is stub mock.
    window.process = { env: {} };
  }
}
