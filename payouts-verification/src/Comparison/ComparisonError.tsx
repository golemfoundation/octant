import React, { FC } from 'react';

type ComparisonErrorProps = {
  error: any;
};

const ComparisonError: FC<ComparisonErrorProps> = ({ error }) => {
  return (
    <div className="error">
      <div className="error__label">Error</div>
      <code>
        {Object.entries(error).map(([key, value], i) => (
          <div className="error__element" key={i}>
            <span className="error__element__key"> {key}:</span>
            <span> {JSON.stringify(value)}</span>
          </div>
        ))}
      </code>
    </div>
  );
};

export default ComparisonError;
