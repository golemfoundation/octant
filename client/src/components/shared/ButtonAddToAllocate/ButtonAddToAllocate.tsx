import cx from 'classnames';
import { useAnimate } from 'framer-motion';
import React, { FC, useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ButtonAddToAllocateIcon from 'components/shared/ButtonAddToAllocate/ButtonAddToAllocateIcon';
import Button from 'components/ui/Button';
import Tooltip from 'components/ui/Tooltip';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './ButtonAddToAllocate.module.scss';
import ButtonAddToAllocateProps from './types';

const ButtonAddToAllocate: FC<ButtonAddToAllocateProps> = ({
  className,
  dataTest,
  onClick,
  id,
  isAddedToAllocate,
  isAllocatedTo,
  isArchivedProject,
  variant = 'iconOnly',
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.buttonAddToAllocate',
  });
  const [scope, animate] = useAnimate();
  const { data: isPatronMode } = useIsPatronMode();
  const [isTooltipClicked, setIsTooltipClicked] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const isDisabled = isArchivedProject || isPatronMode;

  const tooltipText = useMemo(() => {
    if (isArchivedProject && isAllocatedTo) {
      return i18n.t('common.donated');
    }
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
  }, [isAddedToAllocate, isTooltipClicked, isArchivedProject, isAllocatedTo, i18n.language]);

  const ctaButtonText = useMemo(() => {
    if (isAllocatedTo) {
      return i18n.t('common.donated');
    }
    if (isAddedToAllocate && !isArchivedProject) {
      return t('savedProject');
    }
    return t('saveProject');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddedToAllocate, isAllocatedTo, isArchivedProject, i18n.language]);

  const handleTooltipVisibilityChange = (isVisible: boolean) => {
    setIsTooltipVisible(isVisible);
    if (!isVisible) {
      setIsTooltipClicked(false);
    }
  };

  const animateHeartIcon = () => {
    animate(scope?.current, { scale: [1.2, 1] }, { duration: 0.25, ease: 'easeIn' });
  };

  return (
    <Button
      className={cx(
        styles.root,
        styles[`variant--${[variant]}`],
        isAddedToAllocate && styles.isAddedToAllocate,
        isAllocatedTo && styles.isAllocatedTo,
        isArchivedProject && styles.isArchivedProject,
        isDisabled && styles.isDisabled,
        className,
      )}
      dataTest={dataTest}
      Icon={
        variant === 'iconOnly' ? (
          <Tooltip
            hideAfterClick
            isDisabled={isPatronMode || (isArchivedProject && !isAddedToAllocate)}
            onClickCallback={() => {
              if (isTooltipVisible) {
                setIsTooltipClicked(true);
              }
              animateHeartIcon();
            }}
            onVisibilityChange={handleTooltipVisibilityChange}
            position="top"
            showDelay={1000}
            text={tooltipText}
            variant="small"
          >
            <ButtonAddToAllocateIcon
              ref={scope}
              isAddedToAllocate={isAddedToAllocate}
              isAllocatedTo={isAllocatedTo}
              isArchivedProject={!!isArchivedProject}
              isDisabled={!!isDisabled}
            />
          </Tooltip>
        ) : null
      }
      id={id}
      isDisabled={isDisabled}
      onClick={() => {
        onClick();
        animateHeartIcon();
      }}
      variant={variant}
    >
      {variant === 'cta' && (
        <div className={styles.wrapper}>
          {ctaButtonText}
          <ButtonAddToAllocateIcon
            ref={scope}
            isAddedToAllocate={isAddedToAllocate}
            isAllocatedTo={isAllocatedTo}
            isArchivedProject={!!isArchivedProject}
            isDisabled={!!isDisabled}
          />
        </div>
      )}
    </Button>
  );
};

export default memo(ButtonAddToAllocate);
