import { visitWithLoader, mockCoinPricesServer } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`earn: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.earn.absolute);
    });

    it('renders "Locked balance" box', () => {
      cy.get('[data-test=BoxGlmLock__BoxRounded]').should('be.visible');
    });

    it('renders "Personal allocation" box', () => {
      cy.get('[data-test=BoxPersonalAllocation]').should('be.visible');
    });

    it('renders "History"', () => {
      cy.get('[data-test=History]').should('be.visible');
    });

    it('"Lock GLM" button is visible', () => {
      cy.get('[data-test=BoxGlmLock__Button]').should('be.visible');
    });

    it('"Lock GLM" button is disabled', () => {
      cy.get('[data-test=BoxGlmLock__Button]').should('be.disabled');
    });

    it('"Withdraw to wallet" button is visible', () => {
      cy.get('[data-test=BoxPersonalAllocation__Button]').should('be.visible');
    });

    it('"Withdraw to wallet" button is disabled', () => {
      cy.get('[data-test=BoxPersonalAllocation__Button]').should('be.disabled');
    });

    it('"Effective" section has tooltip', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective]').should('be.visible');
    });

    if (!isDesktop) {
      it('"Effective" section tooltip svg icon opens "TooltipEffectiveLockedBalance"', () => {
        cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
        cy.get('[data-test=TooltipEffectiveLockedBalance]').should('be.visible');
      });
    }
  });
});
