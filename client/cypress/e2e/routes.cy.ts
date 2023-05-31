import { visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`routes: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
    });

    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    });

    it('allocation route redirects to allocation view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.allocation.absolute);
      cy.get('[data-test=AllocationView]').should('be.visible');
    });

    it('earn route redirects to earn view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.earn.absolute);
      cy.get('[data-test=EarnView]').should('be.visible');
    });

    it('metrics route redirects to metrics view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.metrics.absolute);
      cy.get('[data-test=MetricsView]').should('be.visible');
    });

    it('onboarding route redirects to onboarding view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.onboarding.absolute);
      cy.get('[data-test=OnboardingView]').should('be.visible');
    });

    it('proposals route redirects to proposals view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.proposals.absolute);
      cy.get('[data-test=ProposalsView]').should('be.visible');
    });

    it('settings route redirects to settings view', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsView]').should('be.visible');
    });

    it('allocation route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.allocation.absolute, ROOT_ROUTES.onboarding.absolute);
    });

    it('earn route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.earn.absolute, ROOT_ROUTES.onboarding.absolute);
    });

    it('metrics route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.metrics.absolute, ROOT_ROUTES.onboarding.absolute);
    });

    it('onboarding route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.onboarding.absolute);
    });

    it('proposals route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.proposals.absolute, ROOT_ROUTES.onboarding.absolute);
    });

    it('settings route redirects to onboarding when onboarding needs to be done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      visitWithLoader(ROOT_ROUTES.settings.absolute, ROOT_ROUTES.onboarding.absolute);
    });

    it('global route redirect to proposals view if onboarding is done', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.proposals.absolute);
    });
  });
});
