import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import React, { FC, Fragment, memo, useEffect, useRef, useState } from 'react';

import AllocationItemRewards from 'components/Allocation/AllocationItemRewards';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import Img from 'components/ui/Img';
import InputText from 'components/ui/InputText';
import Svg from 'components/ui/Svg';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import { bin } from 'svg/misc';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isLoadingError,
  name,
  onChange,
  profileImageSmall,
  value,
}) => {
  const { ipfsGateway } = env;
  const { data: currentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingRewardsThreshold } = useProposalRewardsThreshold();
  const { data: userAllocations } = useUserAllocations();
  const { allocations, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    setAllocations: state.setAllocations,
  }));
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    setAllocations,
    userAllocationsElements: userAllocations?.elements,
  });
  const { isDesktop } = useMediaQuery();
  const [ref, animate] = useAnimate();
  const removeButtonRef = useRef<HTMLDivElement>(null);

  const [constraints, setConstraints] = useState([0, 0]);
  const [startX, setStartX] = useState(0);
  const x = useMotionValue(0);

  const removeButtonScaleTransform = useTransform(x, [constraints[1], constraints[0]], [0.8, 1]);

  const valueToRender = formatUnits(value, 'ether');
  const isEpoch1 = currentEpoch === 1;
  const isLoading = currentEpoch === undefined || isFetchingRewardsThreshold;

  useMotionValueEvent(x, 'change', latest => {
    if (latest < constraints[0]) {
      x.set(constraints[0]);
    }

    if (latest > constraints[1]) {
      x.set(constraints[1]);
    }
  });

  useEffect(() => {
    if (!ref.current || !removeButtonRef.current || isLoading) {
      return;
    }
    const removeButtonLeftPadding = 16;
    const itemHeight = ref.current.getBoundingClientRect().height;

    setConstraints([(itemHeight + removeButtonLeftPadding) * -1, 0]);
  }, [ref, removeButtonRef, isDesktop, isLoading]);

  return (
    <motion.div
      className={cx(styles.root, className)}
      exit={{ opacity: 0, scale: 0.8 }}
      layout
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <motion.div
        ref={removeButtonRef}
        className={styles.removeButton}
        onClick={() => onAddRemoveFromAllocate(address)}
        style={{ scale: removeButtonScaleTransform }}
      >
        <Svg img={bin} size={isDesktop ? [2.4, 2.2] : [2, 1.8]} />
      </motion.div>
      <motion.div
        ref={ref}
        drag="x"
        dragConstraints={{ left: constraints[0], right: constraints[1] }}
        dragElastic={false}
        dragMomentum={false}
        onDragEnd={e => {
          animate(
            ref.current,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore-next-line
            { x: e.x < startX ? constraints[0] : constraints[1] },
            { duration: 0.2 },
          );
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        onDragStart={e => setStartX(e.x)}
        style={{ x }}
      >
        <BoxRounded
          childrenWrapperClassName={styles.boxRoundedChildren}
          className={styles.box}
          hasPadding={false}
        >
          {(isLoading || isLoadingError) && <AllocationItemSkeleton />}
          {!isLoading && !isLoadingError && (
            <Fragment>
              <div className={styles.projectData}>
                <Img
                  className={styles.image}
                  dataTest="ProposalItem__imageProfile"
                  src={`${ipfsGateway}${profileImageSmall}`}
                />
                <div className={styles.nameAndRewards}>
                  <div className={styles.name}>{name}</div>
                  <AllocationItemRewards address={address} />
                </div>
              </div>
              <InputText
                className={cx(styles.input, isEpoch1 && styles.isEpoch1)}
                onChange={event => onChange(address, event.target.value)}
                placeholder="0.000"
                suffix="ETH"
                textAlign="right"
                value={value.isZero() ? undefined : valueToRender}
                variant="allocation"
              />
            </Fragment>
          )}
        </BoxRounded>
      </motion.div>
    </motion.div>
  );
};

export default memo(AllocationItem);
