import cx from 'classnames';
import React, { FC, useState, useEffect } from 'react';

import styles from './Img.module.scss';
import ImgProps from './types';

const Img: FC<ImgProps> = ({ alt = '', className, dataTest, src, sources, ...props }) => {
  const [srcLocal, setSrcLocal] = useState<string>('');

  useEffect(() => {
    if (src) {
      return setSrcLocal(src);
    }
    if (sources) {
      return setSrcLocal(sources[0]);
    }
    return setSrcLocal('');
  }, [src, sources]);

  if (srcLocal === '') {
    return <div className={cx(styles.root, className, styles.isLoading)} />;
  }

  return (
    <img
      alt={alt}
      className={className}
      data-test={dataTest}
      onError={() => {
        if (src !== undefined || !sources) {
          return;
        }

        const indexOfCurrentSource = sources.indexOf(srcLocal);

        if (sources.indexOf(srcLocal) < sources.length - 1) {
          setSrcLocal(sources[indexOfCurrentSource + 1]);
        }
      }}
      src={srcLocal}
      {...props}
    />
  );
};

export default Img;
