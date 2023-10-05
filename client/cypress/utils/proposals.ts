export const getNamesOfProposals = (): string[] => {
  const proposalNames: string[] = [];

  cy.get('[data-test^=ProposalsView__ProposalsListItem').each($element => {
    const name = $element.find('[data-test=ProposalsListItem__name]').text();
    proposalNames.push(name);
  });

  return proposalNames;
};
