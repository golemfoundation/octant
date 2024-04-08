import env from 'env';
import apiService from 'services/apiService';

// eslint-disable-next-line no-shadow
export enum SignatureOpType {
  ALLOCATION = 'allocation',
  TOS = 'tos',
}

export type PendingMultisigSignatures = {
  hash: string | undefined;
  message: string | undefined;
};

export async function apiGetPendingMultisigSignatures(
  userAddress: string,
  signatureOpType: SignatureOpType,
): Promise<PendingMultisigSignatures> {
  return apiService
    .get(`${env.serverEndpoint}multisig-signatures/pending/${userAddress}/type/${signatureOpType}`)
    .then(({ data }) => data);
}

export async function apiPostPendingMultisigSignatures(
  userAddress: string,
  message:
    | string
    | {
        isManuallyEdited: boolean;
        payload: {
          allocations: { amount: string; proposalAddress: string }[];
          nonce: number;
        };
      },
  signatureOpType: SignatureOpType,
): Promise<any> {
  return apiService
    .post(
      `${env.serverEndpoint}multisig-signatures/pending/${userAddress}/type/${signatureOpType}`,
      { message },
    )
    .then(({ data }) => data);
}
