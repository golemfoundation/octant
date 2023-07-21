import Chainable = Cypress.Chainable;

export const loadersShouldNotExist = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=MainLayout__Loader]').should('not.exist');
};

export const checkLocationWithLoader = (url: string): Chainable<any> => {
  cy.hash().should('eq', `#${url}`);
  return loadersShouldNotExist();
};

export const visitWithLoader = (urlEnter: string, urlEnd?: string): Chainable<any> => {
  cy.visit(`#${urlEnter}`);
  return checkLocationWithLoader(urlEnd || urlEnter);
};
