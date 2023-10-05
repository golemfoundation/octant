import { ReactNode } from 'react';

export default interface MetricsGridTileValueProps {
  size?: 'S' | 'M';
  subvalue?: string | ReactNode;
  value: string;
}
