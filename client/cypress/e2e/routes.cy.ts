import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`routes (wallet not connected): ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      mockCoinPricesServer();
      cy.clearLocalStorage();
    });

    it('empty route redirects to projects view', () => {
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.projects.absolute);
      cy.get('[data-test=ProjectsView]').should('be.visible');
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

    it('projects route redirects to projects view', () => {
      visitWithLoader(ROOT_ROUTES.projects.absolute);
      cy.get('[data-test=ProjectsView]').should('be.visible');
    });

    it('settings route redirects to settings view', () => {
      visitWithLoader(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsView]').should('be.visible');
    });
  });
});
