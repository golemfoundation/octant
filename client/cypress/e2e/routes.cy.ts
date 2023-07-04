import { visitWithLoader } from 'cypress/utils/e2e';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

describe('routes (wallet not connected)', () => {
  before(() => {
    cy.clearLocalStorage();
  });

  it('empty route redirects to proposals view', () => {
    visitWithLoader(ROOT.absolute);
    cy.get('[data-test=ProposalsView]').should('be.visible');
  });

  it('allocation route redirects to allocation view', () => {
    visitWithLoader(ROOT_ROUTES.allocation.absolute);
    cy.get('[data-test=AllocationView]').should('be.visible');
  });

  it('earn route redirects to earn view', () => {
    visitWithLoader(ROOT_ROUTES.earn.absolute);
    cy.get('[data-test=EarnView]').should('be.visible');
  });

  it('metrics route redirects to metrics view', () => {
    visitWithLoader(ROOT_ROUTES.metrics.absolute);
    cy.get('[data-test=MetricsView]').should('be.visible');
  });

  it('onboarding route redirects to proposals view', () => {
    visitWithLoader(ROOT_ROUTES.proposals.absolute);
    cy.get('[data-test=ProposalsView]').should('be.visible');
  });

  it('proposals route redirects to proposals view', () => {
    visitWithLoader(ROOT_ROUTES.proposals.absolute);
    cy.get('[data-test=ProposalsView]').should('be.visible');
  });

  it('settings route redirects to settings view', () => {
    visitWithLoader(ROOT_ROUTES.settings.absolute);
    cy.get('[data-test=SettingsView]').should('be.visible');
  });
});
