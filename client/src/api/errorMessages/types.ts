import { Root } from 'api/queryKeys/types';

export type QueryMutationError = {
  message: string;
  title?: string;
  type: 'inline' | 'toast';
};

export type QueryMutationErrorConfig = {
  [key: string]: QueryMutationError;
};

export type IgnoredQueries = [
  Root['cryptoValues'],
  Root['projectsIpfsResults'],
  Root['individualReward'],
];
