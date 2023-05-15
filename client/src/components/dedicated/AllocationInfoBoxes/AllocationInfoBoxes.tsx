import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';

import AllocationInfoBoxesProps from './types';

const AllocationInfoBoxes: FC<AllocationInfoBoxesProps> = ({
  classNameBox,
  isDecisionWindowOpen,
  isConnected,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationInfoBoxes',
  });

  return (
    <Fragment>
      {!isDecisionWindowOpen && (
        <BoxRounded alignment="center" className={classNameBox}>
          {t('decisionWindowClosed')}
        </BoxRounded>
      )}
      {!isConnected && (
        <BoxRounded alignment="center" className={classNameBox}>
          {t('connectWallet')}
        </BoxRounded>
      )}
    </Fragment>
  );
};

export default AllocationInfoBoxes;
