import React, { ReactNode } from 'react';

type GridTileProps = Omit<
  React.PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement>>,
  'title'
> & {
  dataTest?: string;
  showTitleDivider?: boolean;
  title: string | ReactNode;
  titleSuffix?: ReactNode;
};

export default GridTileProps;
