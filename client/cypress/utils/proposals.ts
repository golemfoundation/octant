export const getNamesOfProposals = (): string[] => {
  const proposalNames: string[] = [];

  cy.get('[data-test^=ProposalsView__ProposalItem').each($element => {
    const name = $element.find('[data-test=ProposalItem__name]').text();
    proposalNames.push(name);
  });

  return proposalNames;
};
