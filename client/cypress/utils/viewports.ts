type Viewport = {
  device: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  viewportHeight: number;
  viewportWidth: 471 | 755 | 1280 | 1920;
};

type Viewports = {
  [key: string]: Viewport;
};

const viewports: Viewports = {
  desktop: {
    device: 'desktop',
    isDesktop: true,
    isLargeDesktop: false,
    isMobile: false,
    isTablet: false,
    viewportHeight: 720,
    viewportWidth: 1280,
  },
  largeDesktop: {
    device: 'large-desktop',
    isDesktop: true,
    isLargeDesktop: true,
    isMobile: false,
    isTablet: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
  mobile: {
    device: 'mobile',
    isDesktop: false,
    isLargeDesktop: false,
    isMobile: true,
    isTablet: false,
    viewportHeight: 1020,
    viewportWidth: 471,
  },
  tablet: {
    device: 'tablet',
    isDesktop: false,
    isLargeDesktop: false,
    isMobile: false,
    isTablet: true,
    viewportHeight: 1106,
    viewportWidth: 755,
  },
};

export default viewports;
