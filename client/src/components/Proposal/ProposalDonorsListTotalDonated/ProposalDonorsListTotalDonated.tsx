import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './ProposalDonorsListTotalDonated.module.scss';
import ProposalDonorsListTotalDonatedProps from './types';

const ProposalDonorsListTotalDonated: FC<ProposalDonorsListTotalDonatedProps> = ({
  proposalDonors,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.donors' });
  const totalDonatedSum = proposalDonors?.reduce((acc, curr) => {
    return acc.add(curr.amount);
  }, BigNumber.from(0));

  const totalDonatedSumToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    shouldIgnoreGwei: true,
    valueCrypto: totalDonatedSum,
  });

  return (
    <div className={cx(styles.root, className)}>
      <div>{t('totalDonated')}</div>
      <div>{totalDonatedSumToDisplay}</div>
    </div>
  );
};

export default ProposalDonorsListTotalDonated;
