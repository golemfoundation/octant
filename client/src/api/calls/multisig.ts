import networkConfig from 'constants/networkConfig';
import apiService from 'services/apiService';

type Response = {
  address: string;
  fallbackHandler: string;
  guard: string;
  masterCopy: string;
  modules: string[];
  nonce: string;
  owners: string[];
  threshold: number;
  version: string;
};

export async function apiGetGnosisSafeAccountDetails(address: string): Promise<Response> {
  return apiService.get(`${networkConfig.gnosisSafeApi}api/v1/safes/${address}`);
}
