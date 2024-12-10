// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }) => {
    describe(`[AW IS OPEN] Allocation: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.home.absolute);
      });

      it('User can allocate all rewards to Personal', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
        }
        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__slider]').invoke('val').should('eq', 0);
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('not.eq', '0 ETH');
        cy.get('[data-test=AllocationNavigation__ctaButton]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.get('[data-test=AllocationNavigation__ctaButton]').click();
        cy.wait(500);
        cy.get('[data-test=AllocationNavigation__ctaButton]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__ctaButton]')
          .invoke('text')
          .should('eq', 'Waiting');
        cy.confirmMetamaskTransaction({ gasConfig: 'aggressive' });
        cy.wait(1000);
        cy.get('[data-test=AllocationSummary__personalRewardBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.exist');
        cy.get('[data-test=AllocationNavigation__ctaButton]').invoke('text').should('eq', 'Edit');
      });

      //
    });
  },
);
