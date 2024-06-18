import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import styles from './ProjectDonorsListTotalDonated.module.scss';
import ProjectDonorsListTotalDonatedProps from './types';

const ProjectDonorsListTotalDonated: FC<ProjectDonorsListTotalDonatedProps> = ({
  projectDonors,
  className,
}) => {
  const { i18n } = useTranslation();
  const totalDonatedSum = projectDonors?.reduce((acc, curr) => {
    return acc + curr.amount;
  }, BigInt(0));

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalDonatedSumToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      shouldIgnoreGwei: true,
    },
    showCryptoSuffix: true,
    valueCrypto: totalDonatedSum,
  });

  return (
    <div className={cx(styles.root, className)}>
      <div>{i18n.t('common.totalDonated')}</div>
      <div>{totalDonatedSumToDisplay.primary}</div>
    </div>
  );
};

export default ProjectDonorsListTotalDonated;
