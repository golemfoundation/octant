import apiService from 'services/apiService';

export function apiGetProposal(url: string): Promise<any> {
  return apiService.get(url).then(({ data }) => data);
}
