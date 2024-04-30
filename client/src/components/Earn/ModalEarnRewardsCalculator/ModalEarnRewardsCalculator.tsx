import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EarnRewardsCalculator from 'components/Earn/EarnRewardsCalculator';
import Modal from 'components/ui/Modal';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import { questionMark } from 'svg/misc';

import styles from './ModalEarnRewardsCalculator.module.scss';
import ModalEarnRewardsCalculatorProps from './types';

const ModalEarnRewardsCalculator: FC<ModalEarnRewardsCalculatorProps> = ({ modalProps }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  return (
    <Modal
      className={styles.root}
      dataTest="ModalRewardsCalculator"
      header={
        <>
          <div>{i18n.t('common.estimateRewards')}</div>
          <Tooltip
            className={styles.tooltip}
            dataTest="ModalRewardsCalculator__header__Tooltip"
            position="custom"
            shouldShowOnClickMobile
            text={t('modalHeaderTooltip')}
            tooltipClassName={styles.tooltipContainer}
            tooltipWrapperClassName={styles.tooltipWrapper}
            variant="normal"
          >
            <Svg img={questionMark} size={1.6} />
          </Tooltip>
        </>
      }
      headerClassName={styles.header}
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
    >
      <EarnRewardsCalculator />
    </Modal>
  );
};

export default ModalEarnRewardsCalculator;
