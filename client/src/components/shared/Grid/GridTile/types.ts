import { ReactNode } from 'react';

type GridTileProps = {
  children: ReactNode;
  className?: string;
  dataTest?: string;
  title: string;
  titleSuffix?: ReactNode;
};

export default GridTileProps;
