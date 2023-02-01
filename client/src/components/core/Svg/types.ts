import React from 'react';

// eslint-disable-next-line no-undef
export const SVG_DISPLAY_MODE = ['raw', 'wrapperDefault', 'wrapperCustom'] as const;
export type SvgDisplayMode = (typeof SVG_DISPLAY_MODE)[number];

export const CSS_UNITS = ['rem', '%'] as const;
export type CssUnits = (typeof CSS_UNITS)[number];

export type SvgSize = number | 'auto' | [number | string, number | string];

export interface SvgImageConfig {
  className?: string;
  defaultColor?: string;
  markup?: string;
  path?: string;
  styles?: string;
  viewBox?: string;
}

export interface SvgProps {
  classNameSvg?: string;
  classNameWrapper?: string;
  color?: string;
  displayMode?: SvgDisplayMode;
  img: SvgImageConfig;
  onClick?: () => void;
  size?: SvgSize;
  sizeUnit?: CssUnits;
}

export interface SvgStyles {
  height: string;
  maxHeight: string;
  maxWidth: string;
  minHeight: string;
  minWidth: string;
  width: string;
}

export interface SvgAttrs {
  children?: React.ReactNode;
  className?: string;
  dangerouslySetInnerHTML?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __html: string;
  };
  onClick?: () => void;
  style?: SvgStyles;
  viewBox: string;
}
