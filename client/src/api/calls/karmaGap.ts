import { API_ENDPOINT } from 'constants/karmaGap';
import apiService from 'services/apiService';

export type GrantsPerProgram = {
  data: {
    milestones: {
      createdAt: string;
      data: {
        description: string;
        endsAt: number;
        title: string; // Timestamp.
      };
      updatedAt: string;
    }[];
    project: {
      details: {
        data: {
          description: string;
          slug: string;
          title: string;
        };
      };
      // externalAddresses is set only when recipient does not match project has in Octant.
      externalAddresses?: {
        octant: string;
      };
      recipient: string;
    };
    recipient: string;
    // Date;
    uid: string; 
    updatedAt: string;
  }[];
};

export async function apiGetGrantsPerProgram(
  selectedProgramIds: string,
): Promise<GrantsPerProgram> {
  return apiService
    .get(
      `${API_ENDPOINT}communities/octant/grants?page=0&pageLimit=100&selectedProgramIds=${selectedProgramIds}`,
    )
    .then(({ data }) => data);
}
