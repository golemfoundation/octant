import { ReactNode } from 'react';

type GridTileProps = {
  children: ReactNode;
  className?: string;
  dataTest?: string;
  showTitleDivider?: boolean;
  title: string | ReactNode;
  titleSuffix?: ReactNode;
};

export default GridTileProps;
