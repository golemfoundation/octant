import { Root, QueryKeys } from 'api/queryKeys/types';

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
  Root['individualReward'],
  Root['projectsIpfsResults'],
  QueryKeys['withdrawals'],
];
