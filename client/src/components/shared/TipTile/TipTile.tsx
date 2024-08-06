import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross, info } from 'svg/misc';

import styles from './TipTile.module.scss';
import { TipTileProps } from './types';

const TipTile: React.FC<TipTileProps> = ({
  className,
  dataTest = 'TipTile',
  image,
  imageClassName,
  // isOpen,
  onClose,
  onClick,
  text,
  title,
}) => {
  const isOpen = true;
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const { isDesktop } = useMediaQuery();
  const isProjectAdminMode = useIsProjectAdminMode();
  const shouldSkipEntranceAnimation = useRef(isOpen);

  return (
    <AnimatePresence>
      {!isProjectAdminMode && isOpen && (
        <motion.div
          animate={
            shouldSkipEntranceAnimation.current !== isOpen
              ? {
                  height: isDesktop ? ['0', '22.4rem', '22.4rem'] : ['0', '20rem', '20rem'],
                  marginBottom: ['0', '1.6rem', '1.6rem'],
                  opacity: [0, 0, 1],
                }
              : {}
          }
          className={cx(styles.root, !!onClick && styles.isClickable, className)}
          data-test={dataTest}
          exit={{
            height: isDesktop ? ['22.4rem', '22.4rem', '0'] : ['20rem', '20rem', '0'],
            marginBottom: isDesktop ? ['1.6rem', '1.6rem', '0'] : ['1.6rem', '1.6rem', '0'],
            opacity: [1, 0.1, 0],
          }}
          initial={
            shouldSkipEntranceAnimation.current
              ? {
                  /**
                   * This value does not change dynamically.
                   * Whenever viewport changes reload of the component is required to see new height.
                   * This is not a huge issue as actual viewport changes does not occur often
                   * in real life scenarios.
                   */
                  height: isDesktop ? '22.4rem' : '20rem',
                  marginBottom: '1.6rem',
                  opacity: 1,
                }
              : {}
          }
          onClick={onClick}
          transition={{
            delay: 0.01,
            duration: 0.3,
            // easeOutCubic
            ease: x => 1 - (1 - x) ** 3,
            mass: 1.5,
            stiffness: 800,
          }}
        >
          <div className={styles.content}>
            <div className={styles.info}>
              <Svg img={info} size={3.2} />
              <div className={styles.infoLabel}>{t('gettingStarted')}</div>
            </div>
            <div className={styles.body}>
              <div className={styles.titleAndText}>
                <div className={styles.title}>{title}</div>
                <div className={styles.text}>{text}</div>
              </div>
              <div className={styles.imageWrapper}>
                <Img className={cx(styles.image, imageClassName)} src={image} />
              </div>
            </div>
          </div>
          <Button
            className={styles.buttonClose}
            dataTest={`${dataTest}__Button`}
            Icon={<Svg img={cross} size={1} />}
            onClick={onClose}
            variant="iconOnly"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TipTile;
