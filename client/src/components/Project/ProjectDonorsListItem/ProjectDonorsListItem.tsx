import cx from 'classnames';
import React, { FC, memo } from 'react';

import Identicon from 'components/ui/Identicon';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './ProjectDonorsListItem.module.scss';
import ProjectDonorsListItemProps from './types';

const ProjectDonorsListItem: FC<ProjectDonorsListItemProps> = ({
  donorAddress,
  amount,
  className,
}) => {
  const getValuesToDisplay = useGetValuesToDisplay();

  return (
    <div className={cx(styles.root, className)}>
      <Identicon className={styles.identicon} username={donorAddress} />
      <div className={styles.address}>{truncateEthAddress(donorAddress)}</div>
      <div className={styles.value}>
        {
          getValuesToDisplay({
            cryptoCurrency: 'ethereum',
            getFormattedEthValueProps: { shouldIgnoreGwei: true },
            showCryptoSuffix: true,
            valueCrypto: amount,
          }).primary
        }
      </div>
    </div>
  );
};

export default memo(ProjectDonorsListItem);
