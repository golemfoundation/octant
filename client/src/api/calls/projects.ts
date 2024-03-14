import env from 'env';
import apiService from 'services/apiService';

async function getFirstValid(arrayUrls: string[], baseUri: string, index: number): Promise<any> {
  return apiService
    .get(`${arrayUrls[index]}${baseUri}`)
    .then(({ data }) => ({
      data,
      ipfsGatewayUsed: arrayUrls[index],
    }))
    .catch(e => {
      if (index < arrayUrls.length - 1) {
        return getFirstValid(arrayUrls, baseUri, index + 1);
      }
      throw e;
    });
}

export async function apiGetProject(baseUri: string): Promise<any> {
  const { ipfsGateways } = env;

  return getFirstValid(ipfsGateways.split(','), baseUri, 0).then(({ data }) => data);
}
