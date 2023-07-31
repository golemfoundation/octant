export type QueryMutationError = {
  message: string;
  type: 'inline' | 'toast';
};

export type QueryMutationErrorConfig = {
  [key: string]: QueryMutationError;
};
