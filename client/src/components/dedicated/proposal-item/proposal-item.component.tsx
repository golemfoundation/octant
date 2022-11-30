import React, { FC, Fragment } from 'react';

import { tick } from 'svg/misc';
import Button from 'components/core/button/button.component';
import Img from 'components/core/img/img.component';
import Svg from 'components/core/svg/svg.component';

import { ProposalItemProps } from './types';
import styles from './style.module.scss';

const ProposalItem: FC<ProposalItemProps> = ({
  description,
  isLoadingError,
  name,
  onAddRemoveFromAllocate,
  isAlreadyAdded,
}) => {
  const buttonProps = isAlreadyAdded
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added',
        variant: 'secondaryGrey',
      }
    : {
        label: 'Add to Allocate',
        variant: 'secondary',
      };
  return (
    <div className={styles.root}>
      {isLoadingError ? (
        'Loading of proposal encountered an error.'
      ) : (
        <Fragment>
          <div className={styles.header}>
            <div className={styles.imageLandscapeWrapper}>
              <Img
                className={styles.imageLandscape}
                src="https://via.placeholder.com/600x300.jpg/0000FF/FFFFFF"
              />
            </div>
            <Img
              className={styles.imageProfile}
              src="https://via.placeholder.com/64x64.jpg/000000/FFFFFF"
            />
          </div>
          <div className={styles.body}>
            <div className={styles.name}>{name}</div>
            <div className={styles.description}>{description}</div>
          </div>
          <div className={styles.footer}>
            <div className={styles.numbers}>
              <div className={styles.sum}>$5300</div>
              <div className={styles.percentage}>32%</div>
            </div>
            <div>
              <Button
                className={styles.button}
                onClick={onAddRemoveFromAllocate}
                {...buttonProps}
              />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;
