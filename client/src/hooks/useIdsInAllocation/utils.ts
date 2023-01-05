import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import triggerToast from 'utils/triggerToast';

export const toastDebouncedCantRemoveVotedProject = debounce(
  () =>
    triggerToast({
      message:
        'If you want to remove a project from the Allocate view, you need to unallocate funds from it first.',
      title: 'You allocated to this project',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);
