import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import triggerToast from 'utils/triggerToast';

export const toastDebouncedWithdrawValueTooBig = debounce(
  () =>
    triggerToast({
      message: "You can't withdraw more than is available to withdraw.",
      title: 'Too big value',
      type: 'warning',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);
