import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`metrics: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.metrics.absolute);
    });

    it('renders allocation timer tile', () => {
      cy.get('[data-test=MetricsTimeCounter]').should('be.visible');
    });

    it('renders total projects tile', () => {
      cy.get('[data-test=MetricsTotalProjects]').should('be.visible');
    });

    it('renders total eth staked tile', () => {
      cy.get('[data-test=MetricsTotalEthStaked]').should('be.visible');
    });

    it('renders tile with total glm locked and % of 1B total supply groups', () => {
      cy.get('[data-test=MetricsTotalGlmLockedAndTotalSupply]').should('be.visible');
      cy.get('[data-test=MetricsTotalGlmLockedAndTotalSupply]').children().should('have.length', 2);
    });

    it('renders wallet with glm locked graph tile', () => {
      cy.get('[data-test=MetricsWalletsWithGlmLocked]').should('be.visible');
    });

    it('renders cumulative glm locked graph tile', () => {
      cy.get('[data-test=MetricsCumulativeGlmLocked]').should('be.visible');
    });

    it('renders total addresses tile', () => {
      cy.get('[data-test=MetricsTotalAddresses]').should('be.visible');
    });

    it('renders largest glm lock tile', () => {
      cy.get('[data-test=MetricsLargestGlmLock]').should('be.visible');
    });

    it('renders tiles in correct order', () => {
      const tilesDataTest = [
        'MetricsTimeCounter',
        'MetricsTotalProjects',
        'MetricsTotalEthStaked',
        'MetricsTotalGlmLockedAndTotalSupply',
        'MetricsWalletsWithGlmLocked',
        'MetricsCumulativeGlmLocked',
        'MetricsTotalAddresses',
        'MetricsLargestGlmLock',
      ];

      cy.get('[data-test=MetricsGrid]').children().should('have.length', tilesDataTest.length);

      for (let i = 0; i < tilesDataTest.length; i++) {
        cy.get('[data-test=MetricsGrid]')
          .children()
          .eq(i)
          .invoke('data', 'test')
          .should('eq', tilesDataTest[i]);
      }
    });

    it('renders grid with 4 columns on desktop or with 2 columns on other devices', () => {
      cy.get('[data-test=MetricsGrid]').then(el => {
        const width = parseInt(el.css('width'), 10);
        const rowGap = parseInt(el.css('rowGap'), 10);

        const columnWidth = isDesktop ? (width - 3 * rowGap) / 4 : (width - rowGap) / 2;

        cy.get('[data-test=MetricsGrid]').should(
          'have.css',
          'grid-template-columns',
          isDesktop
            ? `${columnWidth}px ${columnWidth}px ${columnWidth}px ${columnWidth}px`
            : `${columnWidth}px ${columnWidth}px`,
        );
      });
    });
  });
});
