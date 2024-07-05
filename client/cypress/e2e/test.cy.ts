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
cy.location().then(({ pathname }) => {
  cy.visit(pathname);
});
    });
  });
});
