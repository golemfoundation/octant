# EPOCH VERIFICATION

Epoch verification script is a double-check script that can be run after each epoch finalization.

## Usage

Basic script usage looks like the following
```
yarn verify --deployment <deployment> <epoch>
```
but there also exist several indulgence commands i.e.:
```
yarn verify:mainnet <epoch>
```

Check usage with:
```
yarn verify:help
```

If you want to use the script before the end of the AW, you can use the `--simulated` option. This will use the current state of the BE and simulate the end of the AW.

e.g
```
yarn verify:mainnet <epoch> --simulated
```

Script has already defined several, most important deployments (`--deployment` option), but one can connect to any other octant backend using `--url` option.



