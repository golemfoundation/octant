import React, { ReactElement } from 'react';

import './styles/index.scss';

const App = (): ReactElement => {
  // @ts-ignore
  const proposalsAddress = import.meta.env.VITE_PROPOSALS_ADDRESS;

  return (
    <div>
      <p>Client app.</p>
      <p>{proposalsAddress}</p>
    </div>
  );
};

export default App;
