import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import axios, { AxiosError } from 'axios';
import React, { FC, useState } from 'react';

import ComparisonStatus from './ComparisonStatus';
import ComparisonError from './ComparisonError';

type ComparisonProps = {
  uploadedMerkleTree: StandardMerkleTree<any> | null;
};

const Comparison: FC<ComparisonProps> = ({ uploadedMerkleTree }) => {
  const [epoch, setEpoch] = useState<number | null>(null);
  const [comparing, setComparing] = useState<boolean | null>(null);
  const [fetchingMerkleTreeError, setFetchingMerkleTreeError] = useState<AxiosError | null>(null);
  const [rootsAreTheSame, setRootsAreTheSame] = useState<boolean | null>(null);

  const compareRoots = () => {
    if (!uploadedMerkleTree || !epoch) return;
    setComparing(true);

    axios
      // @ts-expect-error TS does not understand the way vite imports envs.
      .get(`${import.meta.env.VITE_SERVER_ENDPOINT}rewards/merkle_tree/${epoch}`)
      .then(({ data }) => {
        const serverMerkleTreeRoot = data.root;
        setRootsAreTheSame(serverMerkleTreeRoot === uploadedMerkleTree.root);
        setComparing(false);
      })
      .catch(e => {
        setFetchingMerkleTreeError(e);
        setComparing(false);
      });
  };

  const handleEpochInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    const {
      target: { value },
    } = event;

    if (!value) {
      setEpoch(null);
      return;
    }

    setEpoch(parseInt(value));
  };

  return (
    <>
      <div className={`epoch ${uploadedMerkleTree ? '' : 'disabled'}`}>
        <label htmlFor="epoch__label">Epoch number of merkle tree to compare: </label>
        <input
          className="epoch__input"
          name="epoch"
          type="number"
          onChange={handleEpochInput}
          disabled={!uploadedMerkleTree}
        ></input>
      </div>
      <button
        className="compareButton"
        onClick={compareRoots}
        disabled={!uploadedMerkleTree || !epoch}
      >
        Compare with server
      </button>
      {comparing !== null && <div className="divider" />}
      {comparing ? (
        <div>Comparing...</div>
      ) : (
        rootsAreTheSame !== null && (
          <ComparisonStatus status={rootsAreTheSame ? 'success' : 'error'} />
        )
      )}
      {comparing === false && fetchingMerkleTreeError && (
        <ComparisonError error={fetchingMerkleTreeError} />
      )}
    </>
  );
};

export default Comparison;
