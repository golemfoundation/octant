import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`metrics: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.metrics.absolute);
    });

    it('renders total projects tile', () => {
      cy.get('[data-test=MetricsGeneralGridTotalProjects]').should('be.visible');
    });

    it('renders total eth staked tile', () => {
      cy.get('[data-test=MetricsGeneralGridTotalEthStaked]').should('be.visible');
    });

    it('renders tile with total glm locked and % of 1B total supply groups', () => {
      cy.get('[data-test=MetricsGeneralGridTotalGlmLockedAndTotalSupply]').should('be.visible');
      cy.get('[data-test=MetricsGeneralGridTotalGlmLockedAndTotalSupply]')
        .children()
        .should('have.length', 2);
    });

    it('renders wallet with glm locked graph tile', () => {
      cy.get('[data-test=MetricsGeneralGridWalletsWithGlmLocked]').should('be.visible');
    });

    it('renders cumulative glm locked graph tile', () => {
      cy.get('[data-test=MetricsGeneralGridCumulativeGlmLocked]').should('be.visible');
    });

    it('renders tiles in correct order', () => {
      const metricsEpochGridTilesDataTest = [
        'MetricsEpochGridTopProjects',
        'MetricsEpochGridTotalDonationsAndPersonal',
        'MetricsEpochGridDonationsVsPersonalAllocations',
        'MetricsEpochGridFundsUsage',
        'MetricsEpochGridTotalUsers',
        'MetricsEpochGridPatrons',
        'MetricsEpochGridCurrentDonors',
        'MetricsEpochGridAverageLeverage',
        'MetricsEpochGridRewardsUnusedAndUnallocatedValue',
        'MetricsEpochGridBelowThreshold',
      ];

      const metricsGeneralGridTilesDataTest = [
        'MetricsGeneralGridTotalGlmLockedAndTotalSupply',
        'MetricsGeneralGridTotalProjects',
        'MetricsGeneralGridTotalEthStaked',
        'MetricsGeneralGridCumulativeGlmLocked',
        'MetricsGeneralGridWalletsWithGlmLocked',
      ];

      cy.get('[data-test=MetricsEpoch__MetricsGrid]')
        .children()
        .should('have.length', metricsEpochGridTilesDataTest.length);

      for (let i = 0; i < metricsEpochGridTilesDataTest.length; i++) {
        cy.get('[data-test=MetricsEpoch__MetricsGrid]')
          .children()
          .eq(i)
          .invoke('data', 'test')
          .should('eq', metricsEpochGridTilesDataTest[i]);
      }

      cy.get('[data-test=MetricsGeneral__MetricsGrid]')
        .children()
        .should('have.length', metricsGeneralGridTilesDataTest.length);

      for (let i = 0; i < metricsGeneralGridTilesDataTest.length; i++) {
        cy.get('[data-test=MetricsGeneral__MetricsGrid]')
          .children()
          .eq(i)
          .invoke('data', 'test')
          .should('eq', metricsGeneralGridTilesDataTest[i]);
      }
    });

    it('renders grid with 4 columns on desktop or with 2 columns on other devices', () => {
      cy.get('[data-test=MetricsEpoch__MetricsGrid]').then(el => {
        const width = parseInt(el.css('width'), 10);
        const rowGap = parseInt(el.css('rowGap'), 10);

        const columnWidth = isDesktop ? (width - 3 * rowGap) / 4 : (width - rowGap) / 2;

        cy.get('[data-test=MetricsEpoch__MetricsGrid]').should(
          'have.css',
          'grid-template-columns',
          isDesktop
            ? `${columnWidth}px ${columnWidth}px ${columnWidth}px ${columnWidth}px`
            : `${columnWidth}px ${columnWidth}px`,
        );
      });

      cy.get('[data-test=MetricsGeneral__MetricsGrid]').then(el => {
        const width = parseInt(el.css('width'), 10);
        const rowGap = parseInt(el.css('rowGap'), 10);

        const columnWidth = isDesktop ? (width - 3 * rowGap) / 4 : (width - rowGap) / 2;

        cy.get('[data-test=MetricsGeneral__MetricsGrid]').should(
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
