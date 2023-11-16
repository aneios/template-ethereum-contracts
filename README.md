# Boilerplate for ethereum solidity smart contract development

## INSTALL

```bash
pnpm i
```

## SCRIPTS

Here is the list of pnpm scripts you can execute:

Some of them rely on [./utils/doAction.ts](./utils/doAction.ts) to allow parameterizing via command line argument (have a look inside if you need modifications)
<br/><br/>

### `pnpm prepare`

As a standard lifecycle pnpm script, it is executed automatically upon install. It generates config files and typechain declarations to get you started with typesafe contract interactions.
<br/><br/>

### `pnpm format` and `pnpm format:fix`

These will format check your code. the `:fix` version will modifiy the files to match the requirement specified in `.prettierrc.json`.
<br/><br/>

### `pnpm compile`

This will compile your contracts.
<br/><br/>

### `pnpm void:deploy`

This will deploy your contracts on the in-memory hardhat network and exit, leaving no trace. Quick way to ensure deployments work as intended without consequences.
<br/><br/>

### `pnpm test [mocha args...]`

This will execute your tests using mocha. you can pass extra arguments to mocha.
<br/><br/>

### `pnpm coverage`

This will produce a test coverage report in the `coverage/` folder.
<br/><br/>

### `pnpm gas`

This will produce a gas report for functions used in tests.
<br/><br/>

### `pnpm dev`

These will run a local hardhat network on `localhost:8545` and deploy your contracts on it. Plus it will watch for any changes and redeploy them.
<br/><br/>

### `pnpm local:dev`

This assumes a local node it running on `localhost:8545`. It will deploy your contracts on it. Plus it will watch for any changes and redeploy them.
<br/><br/>

### `pnpm execute <network> <file.ts> [args...]`

This will execute the script `<file.ts>` against the specified network.
<br/><br/>

### `pnpm deploy <network> [args...]`

This will run the deploy scripts on the specified network.

Behind the scene it uses `hardhat deploy` command so you can append any argument for it.
<br/><br/>

### `pnpm export <network> <file.json>`

This will export the abi+address of deployed contract to `<file.json>`
<br/><br/>

### `pnpm fork:execute <network> [--blockNumber <blockNumber>] [--deploy] <file.ts> [args...]`

This will execute the script `<file.ts>` against a temporary fork of the specified network.

if `--deploy` is used, deploy scripts will be executed.
<br/><br/>

### `pnpm fork:deploy <network> [--blockNumber <blockNumber>] [args...]`

This will deploy the contract against a temporary fork of the specified network.

Behind the scene it uses `hardhat deploy` command so you can append any argument for it.
<br/><br/>

### `pnpm fork:test <network> [--blockNumber <blockNumber>] [mocha args...]`

This will test the contract against a temporary fork of the specified network.
<br/><br/>

### `pnpm fork:dev <network> [--blockNumber <blockNumber>] [args...]`

This will deploy the contract against a fork of the specified network and it will keep running as a node.

Behind the scene it uses `hardhat node` command so you can append any argument for it.
