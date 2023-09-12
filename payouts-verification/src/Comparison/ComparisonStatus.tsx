import React, { FC } from 'react';

type ComparisonStatusProps = {
  status: 'success' | 'error';
};

const ComparisonStatus: FC<ComparisonStatusProps> = ({ status }) => {
  return (
    <div className="comparison">
      <div className="comparison__label">Roots comparison status </div>
      <div
        className={`comparison__status ${
          status === 'success' ? 'comparison__status--success' : 'comparison__status--error'
        }`}
      ></div>
    </div>
  );
};

export default ComparisonStatus;
