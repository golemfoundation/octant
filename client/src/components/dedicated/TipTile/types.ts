import { ReactElement } from 'react';

export type TipTileProps = {
  className?: string;
  image: string;
  infoLabel: string;
  onClose: () => void;
  text: string | ReactElement;
  title: string;
};
