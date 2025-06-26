// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isMobile, isTablet }) => {
    describe(`[AW IS OPEN] Metrics: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.metrics.absolute);
      });

      it('Metrics title is visible and has correct text', () => {
        cy.get('[data-test=MetricsView__title]').should('be.visible');
        cy.get('[data-test=MetricsView__title]').invoke('text').should('eq', 'Explore the data');
      });

      it('"Epoch" secion is visible', () => {
        cy.get('[data-test=MetricsEpoch]').should('be.visible');
      });

      it('"General" secion is visible', () => {
        cy.get('[data-test=MetricsGeneral]').should('be.visible');
      });

      it('"Epoch" section title is visible and has correct text', () => {
        cy.get('[data-test=MetricsEpochHeader__title]').should('be.visible');
        cy.get('[data-test=MetricsEpochHeader__title]')
          .invoke('text')
          .should('eq', isMobile || isTablet ? 'E3 Allocation' : 'Epoch 3 Allocation Window');
      });

      it('"General" section title is visible and has correct text', () => {
        cy.get('[data-test=MetricsGeneral__header__title]').should('be.visible');
        cy.get('[data-test=MetricsGeneral__header__title]')
          .invoke('text')
          .should('eq', 'Cross-epoch metrics');
      });

      it('"Epoch" section title has "OPEN" badge when AW is open', () => {
        cy.get('[data-test=MetricsEpochHeader__openBadge]').should('be.visible');
        cy.get('[data-test=MetricsEpochHeader__openBadge]').invoke('text').should('eq', 'Open');
        cy.get('[data-test=MetricsEpochHeader__openBadge]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#2d9b87');
        cy.get('[data-test=MetricsEpochHeader__openBadge]')
          .then($el => $el.css('textTransform'))
          .should('eq', 'uppercase');
      });

      it('User is able to change epoch via arrow buttons', { scrollBehavior: false }, () => {
        cy.get('[data-test=MetricsEpochHeader__NavigationArrows]').should('be.visible');
        cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]').click();
        cy.get('[data-test=MetricsEpochHeader__title]')
          .invoke('text')
          .should('eq', isMobile || isTablet ? 'E2 Allocation' : 'Epoch 2 Allocation Window');
        cy.get('[data-test=MetricsEpochHeader__NavigationArrows__rightArrow]').click();
        cy.get('[data-test=MetricsEpochHeader__title]')
          .invoke('text')
          .should('eq', isMobile || isTablet ? 'E3 Allocation' : 'Epoch 3 Allocation Window');
      });

      it('"Epoch" section title has epoch dates range when epoch is past', () => {
        cy.get('[data-test=MetricsEpochHeader__openBadge]').should('be.visible');
        cy.get('[data-test=MetricsEpochHeader__epochDuration]').should('not.exist');
        cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]').click();
        cy.get('[data-test=MetricsEpochHeader__openBadge]').should('not.exist');
        cy.get('[data-test=MetricsEpochHeader__epochDuration]').should('be.visible');
      });

      it(
        'Next arrow button is disabled when there is no more next epochs',
        { scrollBehavior: false },
        () => {
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__rightArrow]')
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#fafafa');
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__rightArrowSvg] path')
            .then($el => $el.css('fill'))
            .should('be.colored', '#ebebeb');
          cy.get('[data-test=MetricsEpochHeader__title]')
            .invoke('text')
            .should('eq', isMobile || isTablet ? 'E3 Allocation' : 'Epoch 3 Allocation Window');
        },
      );

      it(
        'Prev arrow button is disabled when there is no more prev epochs ',
        { scrollBehavior: false },
        () => {
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]')
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#fafafa');
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrowSvg] path')
            .then($el => $el.css('fill'))
            .should('be.colored', '#9ea39e');
          cy.get('[data-test=MetricsEpochHeader__title]')
            .invoke('text')
            .should('eq', isMobile || isTablet ? 'E3 Allocation' : 'Epoch 3 Allocation Window');
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]').click();
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]').click();
          cy.get('[data-test=MetricsEpochHeader__title]')
            .invoke('text')
            .should('eq', isMobile || isTablet ? 'E1 Allocation' : 'Epoch 1 Allocation Window');
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrow]')
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#fafafa');
          cy.get('[data-test=MetricsEpochHeader__NavigationArrows__leftArrowSvg] path')
            .then($el => $el.css('fill'))
            .should('be.colored', '#ebebeb');
        },
      );

      it('All tiles in "Epoch" section are visible in correct order', () => {
        const metricsEpochGridTilesDataTest = [
          'MetricsEpochGridTopProjects',
          'MetricsEpochGridFundsUsage',
          'MetricsEpochGridTotalUsers',
          'MetricsEpochGridCurrentDonors',
          'MetricsEpochGridPatrons',
          'MetricsEpochGridAverageLeverage',
          'MetricsEpochGridRewardsUnused',
          'MetricsEpochGridUnallocatedValue',
          'MetricsEpochGridTotalDonations',
          'MetricsEpochGridTotalMatchingFund',
          'MetricsEpochGridDonationsVsMatching',
          'MetricsEpochGridDonationsVsPersonalAllocations',
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
      });

      it('All tiles in "General" section are visible in correct order', () => {
        const metricsGeneralGridTilesDataTest = [
          'MetricsGeneralGridCumulativeGlmLocked',
          'MetricsGeneralGridWalletsWithGlmLocked',
          'MetricsGeneralGridTotalGlmLockedAndTotalSupply',
          'MetricsGeneralGridTotalProjects',
          'MetricsGeneralGridTotalEthStaked',
        ];

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
    });
  },
);
