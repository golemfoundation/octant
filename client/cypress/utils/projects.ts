export const getNamesOfProjects = (): string[] => {
  const projectNames: string[] = [];

  cy.get('[data-test^=ProjectsView__ProjectsListItem').each($element => {
    const name = $element.find('[data-test=ProjectsListItem__name]').text();
    projectNames.push(name);
  });

  return projectNames;
};
