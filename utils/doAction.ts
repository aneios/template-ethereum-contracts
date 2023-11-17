import { spawn } from "child_process";
import { basename } from "path";
import "dotenv/config";

const commandlineArgs = process.argv.slice(2);

function parseArgs(rawArgs: string[], numFixedArgs: number, expectedOptions: Map<string, string>) {
	const fixedArgs: string[] = [];
	const options = new Map<string, string | boolean>();
	const extra: string[] = [];
	const alreadyCounted = new Map<string, boolean>();
	for (let i = 0; i < rawArgs.length; i++) {
		const rawArg = rawArgs[i];
		if (rawArg.startsWith("--")) {
			const optionName = rawArg.slice(2);
			const expectedOptionDetected = expectedOptions.get(optionName);
			if (!alreadyCounted.get(optionName) && expectedOptionDetected) {
				alreadyCounted.set(optionName, true);
				if (expectedOptionDetected === "boolean") {
					options.set(optionName, true);
				} else {
					i++;
					options.set(optionName, rawArgs[i]);
				}
			} else {
				if (fixedArgs.length < numFixedArgs) {
					throw new Error("expected " + numFixedArgs + " fixed args, got only " + fixedArgs.length);
				} else {
					extra.push(rawArg);
				}
			}
		} else {
			if (fixedArgs.length < numFixedArgs) {
				fixedArgs.push(rawArg);
			} else {
				for (const opt of Object.keys(expectedOptions)) {
					alreadyCounted.set(opt, true);
				}
				extra.push(rawArg);
			}
		}
	}
	return { options, extra, fixedArgs };
}

function execute(command: string) {
	return new Promise<void>((resolve, reject) => {
		const onExit = (error: Error) => {
			if (error) {
				return reject(error);
			}
			resolve();
		};
		spawn(command.split(" ")[0], command.split(" ").slice(1), {
			stdio: "inherit",
			shell: true
		}).on("exit", onExit);
	});
}

async function doAction(rawArgs: string[]) {
	const firstArg = rawArgs[0];
	const args = rawArgs.slice(1);
	if (firstArg === "run") {
		const { fixedArgs, extra } = parseArgs(args, 2, new Map());
		const folder = basename(__dirname);
		const filePath = fixedArgs[1].startsWith(folder + "/") ? fixedArgs[1].slice(folder.length + 1) : fixedArgs[1];
		await execute("HARDHAT_DEPLOY_LOG=true HARDHAT_NETWORK=" + fixedArgs[0] +
			" ts-node --files " + filePath + " " + extra.join(" ")
		);
	} else if (firstArg === "deploy") {
		const { fixedArgs, extra } = parseArgs(args, 1, new Map());
		await execute("hardhat --network " + fixedArgs[0] + " deploy --report-gas " + extra.join(" "));
	} else if (firstArg === "verify") {
		const { fixedArgs, extra } = parseArgs(args, 1, new Map());
		const network = fixedArgs[0];
		if (!network) {
			console.error("need to specify the network as first argument");
			return;
		}
		await execute("hardhat --network " + network + " etherscan-verify " + extra.join(" "));
	} else if (firstArg === "export") {
		const { fixedArgs } = parseArgs(args, 2, new Map());
		await execute("hardhat --network " + fixedArgs[0] + " export --export " + fixedArgs[1]);
	} else if (firstArg === "fork:run") {
		const { fixedArgs, options, extra } = parseArgs(args, 2, new Map([
			["deploy", "boolean"],
			["blockNumber", "string"],
			["no-impersonation", "boolean"]
		]));
		const folder = basename(__dirname);
		const filePath = fixedArgs[1].startsWith(folder + "/") ? fixedArgs[1].slice(folder.length + 1) : fixedArgs[1];
		const deploy = options.get("deploy") ? "HARDHAT_DEPLOY_FIXTURE=true" : "";
		const blockNumber = options.get("blockNumber") ? " HARDHAT_FORK_NUMBER=" + options.get("blockNumber") : "";
		const noImpersonation = options.get("no-impersonation") ? " HARDHAT_DEPLOY_NO_IMPERSONATION=true" : "";

		await execute(deploy + " HARDHAT_DEPLOY_LOG=true HARDHAT_FORK=" + fixedArgs[0] +
			blockNumber + noImpersonation +
			" ts-node --files " + filePath + " " + extra.join(" ")
		);
	} else if (firstArg === "fork:deploy") {
		const { fixedArgs, options, extra } = parseArgs(args, 1, new Map([
			["blockNumber", "string"],
			["no-impersonation", "boolean"]
		]));
		const blockNumber = options.get("blockNumber") ? " HARDHAT_FORK_NUMBER=" + options.get("blockNumber") : "";
		const noImpersonation = options.get("no-impersonation") ? " HARDHAT_DEPLOY_NO_IMPERSONATION=true" : "";
		await execute("HARDHAT_FORK=" + fixedArgs[0] +
			blockNumber + noImpersonation +
			" hardhat deploy --report-gas " + extra.join(" ")
		);
	} else if (firstArg === "fork:node") {
		const { fixedArgs, options, extra } = parseArgs(args, 1, new Map([
			["blockNumber", "string"],
			["no-impersonation", "boolean"]
		]));
		const blockNumber = options.get("blockNumber") ? " HARDHAT_FORK_NUMBER=" + options.get("blockNumber") : "";
		const noImpersonation = options.get("no-impersonation") ? " HARDHAT_DEPLOY_NO_IMPERSONATION=true" : "";
		await execute("HARDHAT_FORK=" + fixedArgs[0] +
			blockNumber + noImpersonation +
			" hardhat node --hostname 0.0.0.0 " + extra.join(" ")
		);
	} else if (firstArg === "fork:test") {
		const { fixedArgs, options, extra } = parseArgs(args, 1, new Map([
			["blockNumber", "string"],
			["no-impersonation", "boolean"]
		]));
		const blockNumber = options.get("blockNumber") ? " HARDHAT_FORK_NUMBER=" + options.get("blockNumber") : "";
		const noImpersonation = options.get("no-impersonation") ? " HARDHAT_DEPLOY_NO_IMPERSONATION=true" : "";
		await execute("HARDHAT_DEPLOY_FIXTURE=true HARDHAT_FORK=" + fixedArgs[0] +
			blockNumber + noImpersonation +
			" HARDHAT_COMPILE=true mocha --bail --recursive test " + extra.join(" ")
		);
	} else if (firstArg === "fork:dev") {
		const { fixedArgs, options, extra } = parseArgs(args, 1, new Map([
			["blockNumber", "string"],
			["no-impersonation", "boolean"]
		]));
		const blockNumber = options.get("blockNumber") ? " HARDHAT_FORK_NUMBER=" + options.get("blockNumber") : "";
		const noImpersonation = options.get("no-impersonation") ? " HARDHAT_DEPLOY_NO_IMPERSONATION=true" : "";
		await execute("HARDHAT_FORK=" + fixedArgs[0] +
			blockNumber + noImpersonation +
			" hardhat node --hostname 0.0.0.0 --watch --export contractsInfo.json " + extra.join(" ")
		);
	} else if (firstArg === "tenderly:push") {
		const { fixedArgs } = parseArgs(args, 1, new Map());
		await execute("hardhat --network " + fixedArgs[0] + " tenderly:push");
	}
}

doAction(commandlineArgs);
