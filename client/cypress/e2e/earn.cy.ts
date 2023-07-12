import { visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`earn: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.earn.absolute);
    });

    it('renders "Locked balance" box', () => {
      cy.get('[data-test=BoxGlmLock__BoxRounded]').should('be.visible');
    });

    it('renders "Rewards" box', () => {
      cy.get('[data-test=RewardsBox__BoxRounded]').should('be.visible');
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

    it('"Withdraw rewards" button is visible', () => {
      cy.get('[data-test=BoxWithdrawEth__RewardsBox__Button]').should('be.visible');
    });

    it('"Withdraw rewards" button is disabled', () => {
      cy.get('[data-test=BoxWithdrawEth__RewardsBox__Button]').should('be.disabled');
    });

    it('"Effective" section has tooltip', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective]').should('be.visible');
    });

    it('"Effective" section tooltip svg icon opens "ModalEffectiveLockedBalance"', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance]').should('be.visible');
    });

    it('"ModalEffectiveLockedBalance" has overflow enabled', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance__overflow]').should('exist');
    });

    it('Clicking background when "ModalEffectiveLockedBalance" is open, closes Modal', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance__overflow]').click({ force: true });
      cy.get('[data-test=ModalEffectiveLockedBalance]').should('not.exist');
    });

    it('"ModalEffectiveLockedBalance" has "cross" icon button in header', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance__Button]').should('be.visible');
    });

    it('Clicking on "X" mark in "ModalEffectiveLockedBalance", closes Modal', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance__Button]').click();
      cy.get('[data-test=ModalEffectiveLockedBalance]').should('not.exist');
    });
  });
});
