## Configuration

Ensure that the `.env`  file is present. See `.env.template`.

## Using the app

1. Install the dependencies using `yarn` command.
2. Run the app using `yarn dev` command.
3. Open the App at `http://localhost:5173/`.
3. Upload the merkle tree file, you can get a json from `/rewards/merkle_tree/{epoch}` from Octant backend.
4. Enter the epoch number in the input.
5. Click "compare with server" button.
6. See the result of comparison (green: OK, red: not OK).
