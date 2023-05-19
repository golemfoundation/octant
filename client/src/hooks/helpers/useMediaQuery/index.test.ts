import { renderHook } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';

import useMediaQuery from '.';

function createMatchMedia(width, height) {
  return jest.fn(query => ({
    addListener: jest.fn(),
    matches: mediaQuery.match(query, { height, type: 'screen', width }),
    removeListener: jest.fn(),
  }));
}

describe('useMediaQuery', () => {
  it('test on window 1920px X 1080px', () => {
    const width = 1920;
    const height = 1080;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(true);
    expect(isTablet).toBe(false);
    expect(isMobile).toBe(false);
  });

  it('test on window 1024px X 600px', () => {
    const width = 1024;
    const height = 600;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(true);
    expect(isTablet).toBe(false);
    expect(isMobile).toBe(false);
  });

  it('test on window 720px X 480px', () => {
    const width = 720;
    const height = 480;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(false);
    expect(isTablet).toBe(true);
    expect(isMobile).toBe(false);
  });

  it('test on window 640px X 960px', () => {
    const width = 640;
    const height = 960;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(false);
    expect(isTablet).toBe(true);
    expect(isMobile).toBe(false);
  });

  it('test on window 390px X 844px', () => {
    const width = 390;
    const height = 844;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(false);
    expect(isTablet).toBe(false);
    expect(isMobile).toBe(true);
  });

  it('test on window 320px X 480px', () => {
    const width = 320;
    const height = 480;

    (window as any).matchMedia = createMatchMedia(width, height);

    const { result } = renderHook(() => useMediaQuery());
    const { isDesktop, isTablet, isMobile } = result.current;
    expect(isDesktop).toBe(false);
    expect(isTablet).toBe(false);
    expect(isMobile).toBe(true);
  });
});
