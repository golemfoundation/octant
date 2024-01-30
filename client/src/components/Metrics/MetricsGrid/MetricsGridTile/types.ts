import { ReactNode } from 'react';

type MetricsGridTileGroup = {
  children: ReactNode;
  hasTitileBottomPadding?: boolean;
  title: string;
  titleSuffix?: string | ReactNode;
};

type MetricsGridTileProps =
  | {
      className?: string;
      dataTest?: string;
      groups: [MetricsGridTileGroup];
      size?: 'S' | 'L' | 'custom';
    }
  | {
      className?: string;
      dataTest?: string;
      groups: [MetricsGridTileGroup, MetricsGridTileGroup?];
      size: 'M';
    };

export default MetricsGridTileProps;
