export const isDesktop = (): boolean => {
  return Cypress.config('viewportWidth') > Cypress.env('viewportWidthBreakpointTablet');
};
