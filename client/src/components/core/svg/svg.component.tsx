import React, { FC } from 'react';
import cx from 'classnames';

import { SvgAttrs, SvgProps } from './types';
import styles from './style.module.scss';

const SvgComponent: FC<SvgProps> = ({
  img,
  color,
  classNameWrapper,
  classNameSvg,
  onClick,
  displayMode = 'raw',
}) => {
  const appliedColor = color || img.defaultColor || 'currentColor';
  const viewBox = img.viewBox || '0 0 16 16';

  const svgAttrs: SvgAttrs = {
    className: cx(styles.root, classNameSvg),
    onClick,
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
