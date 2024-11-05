type Viewport = {
  device: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
  isLargeDesktop: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  viewportHeight: number;
  viewportWidth: 471 | 755 | 1280 | 1920;
};

type Viewports = {
  [key: string]: Viewport;
};

const viewports: Viewports = {
  largeDesktop: {
    device: 'large-desktop',
    isLargeDesktop: true,
    isDesktop: true,
    isMobile: false,
    isTablet: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
  desktop: {
    device: 'desktop',
    isLargeDesktop: false,
    isDesktop: true,
    isMobile: false,
    isTablet: false,
    viewportHeight: 720,
    viewportWidth: 1280,
  },
  mobile: {
    device: 'mobile',
    isLargeDesktop: false,
    isDesktop: false,
    isMobile: true,
    isTablet: false,
    viewportHeight: 1020,
    viewportWidth: 471,
  },
  tablet: {
    device: 'tablet',
    isLargeDesktop: false,
    isDesktop: false,
    isMobile: false,
    isTablet: true,
    viewportHeight: 1106,
    viewportWidth: 755,
  },
};

export default viewports;
