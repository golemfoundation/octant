import React from 'react';
import { ToastOptions, toast } from 'react-toastify';

import Toast from 'components/core/Toast/Toast';
import ToastProps from 'components/core/Toast/types';

interface TriggerToast extends ToastProps {
  options?: ToastOptions;
}

export const autoClose = 5000;

export default function triggerToast({ options, ...rest }: TriggerToast): void {
  toast(<Toast {...rest} />, {
    autoClose,
    hideProgressBar: false, // it's hidden in toast.css styles, look for comment there.
    ...options,
  });
}
