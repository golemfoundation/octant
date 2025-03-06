import React, { ReactNode } from 'react';

type GridTileProps = Omit<
  React.PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement>>,
  'title'
> & {
  classNameTitleWrapper?: string;
  dataTest?: string;
  id?: string;
  showTitleDivider?: boolean;
  title: string | ReactNode;
  titleSuffix?: ReactNode;
};

export default GridTileProps;
