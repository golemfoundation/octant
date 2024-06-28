import cx from 'classnames';
import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import debounce from 'lodash/debounce';
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import AllocationItemRewards from 'components/Allocation/AllocationItemRewards';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import Img from 'components/ui/Img';
import InputText from 'components/ui/InputText';
import Svg from 'components/ui/Svg';
import { GWEI_5 } from 'constants/bigInt';
import env from 'env';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';
import useSettingsStore from 'store/settings/store';
import { bin } from 'svg/misc';
import convertFiatToCrypto from 'utils/convertFiatToCrypto';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import {
  comma,
  floatNumberWithUpTo18DecimalPlaces,
  floatNumberWithUpTo2DecimalPlaces,
  floatNumberWithUpTo9DecimalPlaces,
} from 'utils/regExp';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';
import { getAdjustedValue } from './utils';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isError,
  isThereAnyError,
  isLoadingError,
  name,
  onChange,
  onRemoveAllocationElement,
  profileImageSmall,
  value,
  setAddressesWithError,
  rewardsProps,
}) => {
  const { data: individualReward } = useIndividualReward();
  const isGweiRange = individualReward! < GWEI_5;
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues } = useCryptoValues(displayCurrency);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { ipfsGateways } = env;
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingRewardsThreshold } = useProjectRewardsThreshold();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { isDesktop } = useMediaQuery();
  const [ref, animate] = useAnimate();
  const removeButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [localValue, setLocalValue] = useState<AllocationItemProps['value']>('');
  const [constraints, setConstraints] = useState([0, 0]);
  const [startX, setStartX] = useState(0);
  const x = useMotionValue(0);

  const removeButtonScaleTransform = useTransform(x, [constraints[1], constraints[0]], [0.8, 1]);

  const isEpoch1 = currentEpoch === 1;
  const isLoading = currentEpoch === undefined || isFetchingRewardsThreshold;

  const inputSuffix = useMemo(() => {
    if (!isCryptoMainValueDisplay) {
      return displayCurrency.toUpperCase();
    }
    return isGweiRange ? 'GWEI' : 'ETH';
  }, [isGweiRange, isCryptoMainValueDisplay, displayCurrency]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeCallback = useCallback(
    debounce(
      (newAllocationValue, isManualModeEnforced) => {
        onChange(newAllocationValue, isManualModeEnforced);
      },
      250,
      { trailing: true },
    ),
    [onChange],
  );

  const _onChangeCrypto = (newValue: string) => {
    const valueComma = newValue.replace(comma, '.');
    if (
      valueComma &&
      !(isGweiRange ? floatNumberWithUpTo9DecimalPlaces : floatNumberWithUpTo18DecimalPlaces).test(
        valueComma,
      )
    ) {
      return;
    }

    setLocalValue(valueComma);

    if (!isError) {
      onChangeCallback(
        {
          address,
          value: getAdjustedValue(valueComma, isGweiRange, 'divide'),
        },
        true,
      );
    }
  };

  const _onChangeFiat = (newValue: string) => {
    const valueComma = newValue.replace(comma, '.');
    if (valueComma && !floatNumberWithUpTo2DecimalPlaces.test(valueComma)) {
      return;
    }
    const changeCallbackValue = formatUnitsBigInt(
      convertFiatToCrypto({
        cryptoCurrency: 'ethereum',
        cryptoValues,
        displayCurrency,
        valueFiat: valueComma,
      }),
    )
      // @ts-expect-error TS method collision.
      .toLocaleString('fullwide', {
        maximumSignificantDigits: 18,
        useGrouping: false,
      })
      .replace(comma, '.');

    setLocalValue(valueComma);

    if (!isError) {
      onChangeCallback(
        {
          address,
          value: changeCallbackValue,
        },
        true,
      );
    }
  };

  useEffect(() => {
    if (isError || !isDecisionWindowOpen || isInputFocused) {
      return;
    }
    if (isCryptoMainValueDisplay) {
      setLocalValue(getAdjustedValue(value, isGweiRange, 'multiply'));
    } else {
      setLocalValue(
        getValueFiatToDisplay({
          cryptoCurrency: 'ethereum',
          cryptoValues,
          displayCurrency,
          showFiatPrefix: false,
          valueCrypto: parseUnitsBigInt(value, 'ether'),
        }),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isDecisionWindowOpen, isError, isGweiRange, isCryptoMainValueDisplay]);

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

  useEffect(() => {
    if (isError) {
      const timeout = setTimeout(() => {
        if (!inputRef?.current) {
          return;
        }
        onChange({ address, value: '0' }, true);
        setAddressesWithError(addressesWithError =>
          addressesWithError.filter(addressWithError => addressWithError !== address),
        );
        setLocalValue(value);

        // Trick to make inputRef.current.select() work.
        setTimeout(() => {
          if (!inputRef?.current) {
            return;
          }
          inputRef.current.select();
        }, 0);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isError, inputRef, localValue]);

  return (
    <motion.div
      className={cx(styles.root, className)}
      data-test="AllocationItem"
      exit={{ opacity: 0, scale: 0.8 }}
      layout
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      {!isLoading && !isLoadingError && (
        <motion.div
          ref={removeButtonRef}
          className={styles.removeButton}
          data-test="AllocationItem__removeButton"
          onClick={onRemoveAllocationElement}
          style={{ scale: removeButtonScaleTransform }}
        >
          <Svg img={bin} size={isDesktop ? [2.4, 2.2] : [2, 1.8]} />
        </motion.div>
      )}
      <motion.div
        ref={ref}
        drag={isInputFocused ? false : 'x'}
        dragConstraints={{ left: constraints[0], right: constraints[1] }}
        dragElastic={false}
        dragMomentum={false}
        onDragEnd={e => {
          if (e.type === 'pointercancel' || isInputFocused) {
            /**
             * Prevents horizontal scroll to be fired when user scrolls the view vertically
             * on mobile devices.
             *
             * Without that whenever user holds the view on the AllocationItem and wants to drag
             * the view vertically AllocationItem drags itself horizontally, exposing removeButton.
             */
            return;
          }
          animate(
            ref.current,
            // @ts-expect-error e is wrongly typed, doesn't see x property.
            { x: e.pageX < startX ? constraints[0] : constraints[1] },
            { duration: 0.2 },
          );
        }}
        // @ts-expect-error e is wrongly typed, doesn't see x property.
        onDragStart={e => setStartX(e.pageX)}
        style={{ x }}
      >
        {(isLoading || isLoadingError) && <AllocationItemSkeleton />}
        {!isLoading && !isLoadingError && (
          <BoxRounded
            childrenWrapperClassName={cx(
              styles.boxRoundedChildren,
              !isError && isThereAnyError && styles.isThereAnyError,
            )}
            className={styles.box}
            hasPadding={false}
          >
            <div className={styles.projectData}>
              <Img
                className={styles.image}
                dataTest="AllocationItem__imageProfile"
                sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
              />
              <div className={styles.nameAndRewards}>
                <div className={styles.name} data-test="AllocationItem__name">
                  {name}
                </div>
                <AllocationItemRewards
                  address={address}
                  isError={isError}
                  value={value}
                  {...rewardsProps}
                />
              </div>
            </div>
            <InputText
              ref={inputRef}
              className={cx(
                styles.inputWrapper,
                isEpoch1 && styles.isEpoch1,
                isError && styles.isError,
                !!value && styles.isValue,
              )}
              classNameInput={cx(value && styles.isValue)}
              dataTest="AllocationItem__InputText"
              error={isError}
              inputMode="decimal"
              isDisabled={
                !isConnected || !individualReward || !isDecisionWindowOpen || isThereAnyError
              }
              onBlur={() => setIsInputFocused(false)}
              onChange={event =>
                isCryptoMainValueDisplay
                  ? _onChangeCrypto(event.target.value)
                  : _onChangeFiat(event.target.value)
              }
              onFocus={() => {
                inputRef.current?.select();
                setIsInputFocused(true);
              }}
              placeholder="0.000"
              shouldAutoFocusAndSelect={false}
              suffix={inputSuffix}
              textAlign="right"
              value={localValue}
              variant="allocation"
            />
          </BoxRounded>
        )}
      </motion.div>
    </motion.div>
  );
};

export default memo(AllocationItem);
