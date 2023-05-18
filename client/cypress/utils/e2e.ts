import Chainable = Cypress.Chainable;

export const loadersShouldNotExist = (): Chainable<any> => {
  return cy.get('[data-test*=Loader]').should('not.exist');
};

export const checkLocationWithLoader = (url: string): Chainable<any> => {
  cy.hash().should('eq', `#${url}`);
  return loadersShouldNotExist();
};

export const visitWithLoader = (urlEnter: string, urlEnd?: string): Chainable<any> => {
  cy.visit(`#${urlEnter}`);
  cy.get('[data-test*=Loader]').should('be.visible'); // wait for any loader to show up.
  return checkLocationWithLoader(urlEnd || urlEnter);
};
