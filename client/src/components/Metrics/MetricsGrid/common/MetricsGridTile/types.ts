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
      groups: [MetricsGridTileGroup];
      size?: 'S' | 'L';
    }
  | {
      className?: string;
      groups: [MetricsGridTileGroup, MetricsGridTileGroup?];
      size: 'M';
    };

export default MetricsGridTileProps;
