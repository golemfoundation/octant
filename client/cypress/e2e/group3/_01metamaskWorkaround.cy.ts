// Cypress tests based on framer pass only in case when test tab is active (chrome doesn't block animations).
// On first test, active tab is MetaMask and on each next active tab is test tab - due to that we had to add this workaround.
// Only for `synpress run` command
describe('Workaround for first test (active tab is MetaMask instead of Cypress tab)', () => {
  it('true', () => {
    expect(true).to.be.true;
  });
});
