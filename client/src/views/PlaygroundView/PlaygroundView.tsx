import React, { ReactElement } from 'react';

/**
 * This view is used by Cypress when moving time.
 * It fetches no additional data to not disturb Cypress process
 * when they become outdated after moving time.
 *
 * When time movement was made in any other view, CY reported errors coming from the backend.
 */
const PlaygroundView = (): ReactElement => <div data-test="PlaygroundView">Playground</div>;

export default PlaygroundView;
