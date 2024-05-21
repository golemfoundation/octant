import cx from 'classnames';
import React, { FC, memo } from 'react';

import Identicon from 'components/ui/Identicon';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './ProjectDonorsListItem.module.scss';
import ProjectDonorsListItemProps from './types';

const ProjectDonorsListItem: FC<ProjectDonorsListItemProps> = ({
  donorAddress,
  amount,
  className,
}) => {
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  return (
    <div className={cx(styles.root, className)}>
      <Identicon className={styles.identicon} username={donorAddress} />
      <div className={styles.address}>{truncateEthAddress(donorAddress)}</div>
      <div className={styles.value}>
        {isCryptoMainValueDisplay
          ? getValueCryptoToDisplay({
              cryptoCurrency: 'ethereum',
              getFormattedEthValueProps: { shouldIgnoreGwei: true },
              valueCrypto: amount,
            }).fullString
          : getValueFiatToDisplay({
              cryptoCurrency: 'ethereum',
              cryptoValues,
              displayCurrency: displayCurrency!,
              error,
              valueCrypto: amount,
            })}
      </div>
    </div>
  );
};

export default memo(ProjectDonorsListItem);
