import { ReactNode } from 'react';

type MetricsGridTileGroup = {
  children: ReactNode;
  title: string;
  titleSuffix?: string;
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
