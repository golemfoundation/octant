import cx from 'classnames';
import { useAnimate } from 'framer-motion';
import React, { FC, useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import Tooltip from 'components/core/Tooltip/Tooltip';
import { checkMark, heart } from 'svg/misc';

import styles from './ButtonAddToAllocate.module.scss';
import ButtonAddToAllocateProps from './types';

const ButtonAddToAllocate: FC<ButtonAddToAllocateProps> = ({
  className,
  dataTest,
  onClick,
  isAddedToAllocate,
  isAllocatedTo,
  isArchivedProposal,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.buttonAddToAllocate',
  });
  const [scope, animate] = useAnimate();
  const [isTooltipClicked, setIsTooltipClicked] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const tooltipText = useMemo(() => {
    if (isAddedToAllocate && isTooltipClicked) {
      return t('saved');
    }
    if (!isAddedToAllocate && isTooltipClicked) {
      return t('removed');
    }
    if (isAddedToAllocate && !isTooltipClicked) {
      return t('removeFromAllocate');
    }
    return t('saveToAllocate');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddedToAllocate, isTooltipClicked]);

  const handleTooltipVisibilityChange = (isVisible: boolean) => {
    setIsTooltipVisible(isVisible);
    if (!isVisible) {
      setIsTooltipClicked(false);
    }
  };

  return (
    <Button
      className={cx(
        styles.root,
        isAddedToAllocate && styles.isAddedToAllocate,
        isAllocatedTo && styles.isAllocatedTo,
        isArchivedProposal && styles.isArchivedProposal,
        className,
      )}
      dataTest={dataTest}
      Icon={
        <Tooltip
          hideAfterClick
          isDisabled={isArchivedProposal}
          onClickCallback={() => {
            if (isTooltipVisible) {
              setIsTooltipClicked(true);
            }
            animate(scope?.current, { scale: [1.2, 1] }, { duration: 0.25, ease: 'easeIn' });
          }}
          onVisibilityChange={handleTooltipVisibilityChange}
          position="top"
          showDelay={1000}
          text={tooltipText}
          variant="small"
        >
          <div ref={scope} className={styles.svgWrapper}>
            <Svg img={isAllocatedTo ? checkMark : heart} size={3.2} />
          </div>
        </Tooltip>
      }
      isDisabled={isArchivedProposal}
      onClick={onClick}
      variant="iconOnly"
    />
  );
};

export default memo(ButtonAddToAllocate);
