type Viewport = {
  device: 'mobile' | 'tablet' | 'desktop';
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  viewportHeight: number;
  viewportWidth: 471 | 755 | 1920;
};

type Viewports = {
  [key: string]: Viewport;
};

const viewports: Viewports = {
  desktop: {
    device: 'desktop',
    isDesktop: true,
    isMobile: false,
    isTablet: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
  mobile: {
    device: 'mobile',
    isDesktop: false,
    isMobile: true,
    isTablet: false,
    viewportHeight: 1020,
    viewportWidth: 471,
  },
  tablet: {
    device: 'tablet',
    isDesktop: false,
    isMobile: false,
    isTablet: true,
    viewportHeight: 1106,
    viewportWidth: 755,
  },
};

export default viewports;
