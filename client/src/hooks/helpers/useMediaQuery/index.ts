import { useEffect, useState } from 'react';

import { phoneOnly, tabletOnly, desktopOnly, largeDesktopOnly } from 'styles/utils/mediaQueries';

import { UseMediaQuery } from './types';

function useMediaQuery(): UseMediaQuery {
  const getMatches = (q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [isLargeDesktop, setIsLargeDesktop] = useState<boolean>(getMatches(largeDesktopOnly));
  const [isDesktop, setIsDesktop] = useState<boolean>(getMatches(desktopOnly));
  const [isTablet, setIsTablet] = useState<boolean>(getMatches(tabletOnly));
  const [isMobile, setIsMobile] = useState<boolean>(getMatches(phoneOnly));

  function handleChangeLargeDesktop() {
    setIsLargeDesktop(getMatches(largeDesktopOnly));
  }

  function handleChangeDesktop() {
    setIsDesktop(getMatches(desktopOnly));
  }

  function handleChangeTablet() {
    setIsTablet(getMatches(tabletOnly));
  }

  function handleChangeMobile() {
    setIsMobile(getMatches(phoneOnly));
  }

  useEffect(() => {
    const matchMediaLargeDesktop = window.matchMedia(largeDesktopOnly);
    const matchMediaDesktop = window.matchMedia(desktopOnly);
    const matchMediaTablet = window.matchMedia(tabletOnly);
    const matchMediaMobile = window.matchMedia(phoneOnly);

    // Listen matchMedia
    if (matchMediaLargeDesktop.addListener) {
      matchMediaLargeDesktop.addListener(handleChangeLargeDesktop);
    } else {
      matchMediaLargeDesktop.addEventListener('change', handleChangeLargeDesktop);
    }

    if (matchMediaDesktop.addListener) {
      matchMediaDesktop.addListener(handleChangeDesktop);
    } else {
      matchMediaDesktop.addEventListener('change', handleChangeDesktop);
    }

    if (matchMediaTablet.addListener) {
      matchMediaTablet.addListener(handleChangeTablet);
    } else {
      matchMediaTablet.addEventListener('change', handleChangeTablet);
    }

    if (matchMediaMobile.addListener) {
      matchMediaMobile.addListener(handleChangeMobile);
    } else {
      matchMediaMobile.addEventListener('change', handleChangeMobile);
    }

    return () => {
      if (matchMediaLargeDesktop.removeListener) {
        matchMediaLargeDesktop.removeListener(handleChangeLargeDesktop);
      } else {
        matchMediaLargeDesktop.removeEventListener('change', handleChangeLargeDesktop);
      }

      if (matchMediaDesktop.removeListener) {
        matchMediaDesktop.removeListener(handleChangeDesktop);
      } else {
        matchMediaDesktop.removeEventListener('change', handleChangeDesktop);
      }

      if (matchMediaTablet.removeListener) {
        matchMediaTablet.removeListener(handleChangeTablet);
      } else {
        matchMediaTablet.removeEventListener('change', handleChangeTablet);
      }

      if (matchMediaMobile.removeListener) {
        matchMediaMobile.removeListener(handleChangeMobile);
      } else {
        matchMediaMobile.removeEventListener('change', handleChangeMobile);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isDesktop,
    isLargeDesktop,
    isMobile,
    isTablet,
  };
}

export default useMediaQuery;
