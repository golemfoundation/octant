import { useEffect, useState } from 'react';

import { tabletOnly, desktopOnly } from 'styles/utils/mediaQueries';

import { UseMediaQuery } from './types';

function useMediaQuery(): UseMediaQuery {
  const getMatches = (q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [isDesktop, setIsDesktop] = useState<boolean>(getMatches(desktopOnly));
  const [isTablet, setIsTablet] = useState<boolean>(getMatches(tabletOnly));

  function handleChangeDesktop() {
    setIsDesktop(getMatches(desktopOnly));
  }

  function handleChangeTablet() {
    setIsTablet(getMatches(tabletOnly));
  }

  useEffect(() => {
    const matchMediaDesktop = window.matchMedia(desktopOnly);
    const matchMediaTablet = window.matchMedia(tabletOnly);

    // Listen matchMedia
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

  return { isDesktop, isMobile: !isDesktop && !isTablet, isTablet };
}

export default useMediaQuery;
