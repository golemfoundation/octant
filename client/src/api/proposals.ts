import apiService from 'services/apiService';
import env from 'env';

export function apiGetProposal(baseUri: string): Promise<any> {
  const { ipfsGateway } = env;
  return apiService.get(ipfsGateway + baseUri).then(({ data }) => data);
}
