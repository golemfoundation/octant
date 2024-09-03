import { ReactNode } from 'react';

type GridTileProps = {
  children: ReactNode;
  className?: string;
  dataTest?: string;
  title: string | ReactNode;
  titleSuffix?: ReactNode;
  showTitleDivider?: boolean;
};

export default GridTileProps;
