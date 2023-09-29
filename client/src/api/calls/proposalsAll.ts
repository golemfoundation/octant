import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  Objects: { Hash: string; Links: { Hash: string; Name: string }[] }[];
};

export function apiGetProposalsAll(proposalsCid: string): Promise<Response> {
  const { projectsAllIpfsGateway } = env;
  return apiService.get(`${projectsAllIpfsGateway}?arg=${proposalsCid}`).then(({ data }) => data);
}
