// script used to fund account from a geth coinbase account (geth --dev)
import { ethers } from "ethers";
import { default as hre } from "hardhat";

const { JsonRpcProvider } = hre.ethers;

function wait(numSec: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, numSec * 1000);
	});
}

async function main() {
	console.log("funding from coinbase ...");
	let found;
	while (!found) {
		try {
			await hre.ethers.provider.send("eth_chainId", []);
			found = true;
		} catch (e) { } // TODO timeout ?
		if (!found) {
			console.log("retrying...");
			await wait(1);
		}
	}

	if (!("url" in hre.network.config)) {
		console.log("cannot run on in memory hardhat network.");
		return;
	}

	const coinbase = await hre.ethers.provider.send("eth_coinbase", []);
	if (!coinbase) {
		console.log("no coinbase");
		return;
	}
	const accounts = await hre.ethers.getSigners();
	let accountsToFund = accounts;
	if (coinbase === accounts[0]) {
		accountsToFund = accounts.slice(1);
	}

	const coinbaseBalance = await hre.ethers.provider.getBalance(coinbase);
	const nonce = await hre.ethers.provider.getTransactionCount(coinbase);
	const maxAmount = BigInt("10000000000000000000");
	let amount = coinbaseBalance / BigInt(accountsToFund.length);
	if (amount > maxAmount) amount = maxAmount;


	if (coinbaseBalance > 0) {
		const rawProvider = new JsonRpcProvider(hre.network.config.url);
		const coinbaseSigner = rawProvider.getSigner(coinbase);
		const txs: ethers.TransactionResponse[] = [];
		for (let i = 0; i < accountsToFund.length; i++) {
			const to = accountsToFund[i];
			const tx = await (await coinbaseSigner).sendTransaction({
				to,
				value: (amount - 21000n).toString(16),
				nonce: (nonce + i)
			});
			console.log(to + ": " + tx.hash);
			txs.push(tx);
		}
		await Promise.all(txs.map((tx) => tx.wait()));
	} else {
		console.log("coinbase has zero balance");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
