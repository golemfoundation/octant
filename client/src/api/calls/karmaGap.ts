import { API_ENDPOINT } from 'constants/karmaGap';
import apiService from 'services/apiService';

export type Milestone = {
  completed: {
    status: {
      createdAt: string;
      data: {
        reason: string;
      };
    };
  };
  createdAt: string;
  data: {
    description: string;
    endsAt: number;
    title: string; // Timestamp.
  };
  uid: string;
  updatedAt: string;
};

export type GrantPerProgram = {
  // external is set only when recipient does not match project has in Octant.
  external?: {
    octant?: string[];
  };
  milestones: Milestone[];
  project: {
    details: {
      data: {
        description: string;
        slug: string;
        title: string;
      };
      recipient: string;
    };
    recipient: string;
  };
  recipient: string;
  // Date;
  uid: string;
  updatedAt: string;
};

export type GrantsPerProgram = {
  data: GrantPerProgram[];
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
