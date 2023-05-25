## Notes on WithdrawalsTarget contract
Code is written with assumption that barely any state is there.
This means that skipping versions is OK (upgrading from 1 to any X),
and downgrading is also OK.

## Verification on etherscan
Verification on etherscan (via web interface) can be done in two steps:
1) verify lib contract (etherscan will tell where it is), using `hardhat flatten` output with minor editing, removing extra licensing lines.
2) verify proxy contract, enjoy `Read as Proxy`

## Using hardhat-deploy and proxies

1) Proxy used is EIP173ProxyWithReceive
2) Deployment is done with `deploy(...)`:
```
await deploy('YourContract', {
      from: deployer,
      proxy: {
        proxyContract: 'EIP173ProxyWithReceive'
      },
    });
```
