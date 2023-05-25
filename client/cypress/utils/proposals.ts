export const getNamesOfProposals = (): string[] => {
  const proposalNames: string[] = [];

  // Wait for all loaders (in ProposalItem) to disappear.
  cy.get('[data-test*=Loader]').should('not.exist');

  cy.get('[data-test^=ProposalsView__ProposalItem').each($element => {
    const name = $element.find('[data-test=ProposalItem__name]').text();
    proposalNames.push(name);
  });

  return proposalNames;
};
