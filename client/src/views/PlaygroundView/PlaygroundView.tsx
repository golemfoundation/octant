import React, { ReactElement } from 'react';

/**
 * This view is used by Cypress when moving time.
 * It doesn't make any requests, so it interferes with Cypress as little as possible.
 */
const PlaygroundView = (): ReactElement => <div data-test="PlaygroundView">Playground</div>;

export default PlaygroundView;
