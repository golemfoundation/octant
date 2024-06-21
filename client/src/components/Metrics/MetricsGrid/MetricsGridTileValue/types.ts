import { ReactNode } from 'react';

export default interface MetricsGridTileValueProps {
  dataTest?: string;
  isLoading?: boolean;
  isThinSubvalueLoader?: boolean;
  showSubvalueLoader?: boolean;
  size?: 'S' | 'M';
  subvalue?: string | ReactNode;
  value: string;
}
