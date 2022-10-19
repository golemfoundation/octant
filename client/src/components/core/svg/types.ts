import React from 'react';

// eslint-disable-next-line no-undef
export const SVG_DISPLAY_MODE = ['raw', 'wrapperDefault', 'wrapperCustom'] as const;
export type SvgDisplayMode = typeof SVG_DISPLAY_MODE[number];

export interface SvgImageConfig {
  defaultColor?: string;
  markup?: string;
  path?: string;
  viewBox?: string;
}

export interface SvgProps {
  classNameSvg?: string;
  classNameWrapper?: string;
  color?: string;
  displayMode?: SvgDisplayMode;
  img: SvgImageConfig;
  onClick?: () => void;
}

export interface SvgAttrs {
  children?: React.ReactNode;
  className?: string;
  dangerouslySetInnerHTML?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __html: string;
  };
  onClick?: () => void;
  viewBox: string;
}
