import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import React, { useState } from 'react';

import './App.css';
import Comparison from './Comparison';

function App() {
  const [uploadedMerkleTree, setUploadedMerkleTree] = useState<StandardMerkleTree<any> | null>(
    null,
  );

  const handleMerkleTreeInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (!event.target.files) return;
    const merkleTreeFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(merkleTreeFile, 'UTF-8');
    fileReader.onload = e => {
      if (!e?.target) return;
      const tree = StandardMerkleTree.load(JSON.parse(e.target.result as string));
      setUploadedMerkleTree(tree);
    };
  };

  return (
    <div className="App">
      <div className="title">Merkle tree root comparison script</div>
      <div className="uploadMerkleTree">
        <div className="uploadMerkleTree__label">Upload merkle tree (.json)</div>
        <input
          className="uploadMerkleTreeInput__input"
          type="file"
          onChange={handleMerkleTreeInput}
        />
      </div>
      <div className="divider" />
      <Comparison uploadedMerkleTree={uploadedMerkleTree} />
    </div>
  );
}

export default App;
