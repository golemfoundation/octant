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


Script has already defined several, most important deployments (`--deployment` option), but one can connect to any other octant backend using `--url` option. 



