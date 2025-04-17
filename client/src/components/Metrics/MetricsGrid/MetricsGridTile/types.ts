import { ReactNode } from 'react';

export const METRICS_GRID_TILE_SZIES = ['S', 'M', 'L', 'custom'] as const;
export type MetricsGridTileSizes = (typeof METRICS_GRID_TILE_SZIES)[number];

type MetricsGridTileGroup = {
  children: ReactNode;
  hasTitleLargeBottomPadding?: boolean;
  title: string;
  titleSuffix?: string | ReactNode;
};

type MetricsGridTileProps =
  | {
      className?: string;
      dataTest?: string;
      groups: [MetricsGridTileGroup];
      id?: string;
      size?: Exclude<MetricsGridTileSizes, 'M'>;
    }
  | {
      className?: string;
      dataTest?: string;
      groups: [MetricsGridTileGroup, MetricsGridTileGroup?];
      id?: string;
      size: Exclude<MetricsGridTileSizes, 'S' | 'L' | 'custom'>;
    };

export default MetricsGridTileProps;
