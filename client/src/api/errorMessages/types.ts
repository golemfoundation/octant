export type Error = {
  message: string;
  type: 'inline' | 'toast';
};

export type ErrorsConfig = {
  [key: string]: Error;
};
