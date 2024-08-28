import { ReactNode } from 'react';

type GridTileProps = {
  title: string;
  children: ReactNode;
  titleSuffix?: ReactNode;
  className?: string;
  dataTest?: string;
};

export default GridTileProps;
