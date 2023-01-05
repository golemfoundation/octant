import React, { FC } from 'react';
import cx from 'classnames';
import isArray from 'lodash/isArray';

import { SvgAttrs, SvgProps, SvgStyles } from './types';
import styles from './style.module.scss';

const SvgComponent: FC<SvgProps> = ({
  img,
  color,
  classNameWrapper,
  classNameSvg,
  onClick,
  displayMode = 'raw',
  size = 'auto',
  sizeUnit = 'rem',
}) => {
  const parsedSize = isArray(size) ? size : [size, size];
  const width = parsedSize[0] === 'auto' ? parsedSize[0] : `${parsedSize[0]}${sizeUnit}`;
  const height = parsedSize[1] === 'auto' ? parsedSize[1] : `${parsedSize[1]}${sizeUnit}`;

  const svgStyles: SvgStyles = {
    height,
    maxHeight: height,
    maxWidth: width,
    minHeight: height,
    minWidth: width,
    width,
  };

  const appliedColor = color || img.defaultColor || 'currentColor';
  const viewBox = img.viewBox || '0 0 16 16';

  const svgAttrs: SvgAttrs = {
    className: cx(styles.root, img.className, classNameSvg),
    onClick,
    style: svgStyles,
    viewBox,
  };

  if (img.markup) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    svgAttrs.dangerouslySetInnerHTML = { __html: img.markup };
  } else {
    svgAttrs.children = <path d={img.path} fill={appliedColor} />;
  }

  const svg = <svg {...svgAttrs} />;

  if (displayMode === 'raw') {
    return svg;
  }
  return <i className={cx(styles.root, classNameWrapper)}>{svg}</i>;
};

export default SvgComponent;
