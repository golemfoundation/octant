import env from 'env';
import apiService from 'services/apiService';

export function apiGetProposal(baseUri: string): Promise<any> {
  const { ipfsGateway } = env;
  return apiService.get(`${ipfsGateway}${baseUri}`).then(({ data }) => data);
}
