import Chainable = Cypress.Chainable;

export const loadersShouldNotExist = (): Chainable<any> => {
  return cy.get('[data-test*=Loader]').should('not.exist');
};

export const visitWithLoader = (urlEnter: string, urlEnd?: string): Chainable<any> => {
  cy.visit(urlEnter);
  cy.location('hash').should('eq', `#${urlEnd || urlEnter}`);
  return loadersShouldNotExist();
};
