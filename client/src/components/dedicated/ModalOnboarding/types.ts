import { ReactElement } from 'react';

export interface Step {
  header: string;
  image: string;
  imageClassName?: string;
  text: ReactElement;
}
