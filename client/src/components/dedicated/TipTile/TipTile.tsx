import cx from 'classnames';
import React from 'react';

import Button from 'components/core/Button/Button';
import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import { cross, info } from 'svg/misc';

import styles from './TipTile.module.scss';
import { TipTileProps } from './types';

const TipTile: React.FC<TipTileProps> = ({ onClose, infoLabel, title, text, image, className }) => (
  <div className={cx(styles.root, className)}>
    <div>
      <div className={styles.info}>
        <Svg img={info} size={3.2} />
        <div className={styles.infoLabel}>{infoLabel}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <div className={styles.text}>{text}</div>
      </div>
    </div>
    <div className={styles.imageWrapper}>
      <Img className={styles.image} src={image} />
    </div>
    <Button
      className={styles.buttonClose}
      Icon={<Svg img={cross} size={1} />}
      onClick={onClose}
      variant="iconOnly"
    />
  </div>
);

export default TipTile;
