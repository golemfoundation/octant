import { API_ENDPOINT } from 'constants/karmaGap';
import apiService from 'services/apiService';

export async function apiGetPrograms(selectedProgramIds: string): Promise<any> {
  return apiService
    .get(
      `${API_ENDPOINT}communities/octant/grants?page=0&pageLimit=100&selectedProgramIds=${selectedProgramIds}`,
    )
    .then(({ data }) => data);
}
