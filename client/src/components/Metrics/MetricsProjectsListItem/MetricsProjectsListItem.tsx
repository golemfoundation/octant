import cx from 'classnames';
import React, { FC, memo } from 'react';

import Img from 'components/ui/Img/Img';
import env from 'env';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './MetricsProjectsListItem.module.scss';
import MetricsProjectsListItemProps from './types';

const MetricsProjectsListItem: FC<MetricsProjectsListItemProps> = ({
  numberOfDonors,
  donations,
  matchFunding,
  total,
  dataTest = 'MetricsProjectsListItem',
  image,
  name,
}) => {
  const { ipfsGateways } = env;
  const { isLargeDesktop } = useMediaQuery();

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.logoNameGroup}>
        <Img
          alt="project logo"
          className={styles.image}
          sources={ipfsGateways.split(',').map(element => `${element}${image}`)}
        />
        <div className={styles.name} data-test={`${dataTest}__name`}>
          {name}
        </div>
      </div>
      {isLargeDesktop && (
        <>
          <div className={styles.value} data-test={`${dataTest}__numberOfDonors`}>
            {numberOfDonors}
          </div>
          <div className={styles.value} data-test={`${dataTest}__donations`}>
            {donations}
          </div>
          <div className={styles.value} data-test={`${dataTest}__matchFunding`}>
            {matchFunding}
          </div>
        </>
      )}
      <div className={cx(styles.value, styles.total)} data-test={`${dataTest}__total`}>
        {total}
      </div>
    </div>
  );
};

export default memo(MetricsProjectsListItem);
