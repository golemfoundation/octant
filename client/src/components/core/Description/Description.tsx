import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Description.module.scss';
import DescriptionProps from './types';

const Description: FC<DescriptionProps> = ({
  className,
  dataTest,
  text,
  innerHtml,
  variant = 'medium',
}) => {
  const props = innerHtml
    ? {
        dangerouslySetInnerHTML: {
          // Following .replace is a nasty solution adding targets to all links, opening them in new tabs.
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __html: innerHtml.replace(/href/g, "target='_blank' href"),
        },
      }
    : undefined;
  return (
    <div
      className={cx(styles.root, styles[`variant--${variant}`], className)}
      data-test={dataTest}
      {...props}
    >
      {text}
    </div>
  );
};

export default Description;
