import debounce from 'lodash/debounce';

import { triggerToast } from 'utils/triggerToast';

const debounceTime = 5000;

export const unstakeValueTooBigDebouncedToast = debounce(
  () =>
    triggerToast({
      message: "You can't unstake more than is staked.",
      title: 'Too big value',
    }),
  debounceTime,
  { leading: true },
);

export const stakeValueTooBigDebouncedToast = debounce(
  () =>
    triggerToast({
      message: "You can't stake more than is available in the wallet.",
      title: 'Too big value',
    }),
  debounceTime,
  { leading: true },
);
