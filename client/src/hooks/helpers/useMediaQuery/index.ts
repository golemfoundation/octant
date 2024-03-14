import { useEffect, useState } from 'react';

import { tabletOnly, desktopOnly, largeDesktopOnly } from 'styles/utils/mediaQueries';

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

  function handleChangeLargeDesktop() {
    setIsLargeDesktop(getMatches(largeDesktopOnly));
  }

  function handleChangeDesktop() {
    setIsDesktop(getMatches(desktopOnly));
  }

  function handleChangeTablet() {
    setIsTablet(getMatches(tabletOnly));
  }

  useEffect(() => {
    const matchMediaLargeDesktop = window.matchMedia(largeDesktopOnly);
    const matchMediaDesktop = window.matchMedia(desktopOnly);
    const matchMediaTablet = window.matchMedia(tabletOnly);

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
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isDesktop,
    isLargeDesktop,
    isMobile: !isDesktop && !isTablet && !isLargeDesktop,
    isTablet,
  };
}

export default useMediaQuery;
