#!/usr/bin/env node
import {existsSync, copyFileSync} from "fs";
function copyFromDefault(p: string) {
	if (!existsSync(p)) {
		const defaultFile = p + ".default";
		if (existsSync(defaultFile)) {
			copyFileSync(p + ".default", p);
		}
	}
}

[".vscode/settings.json", ".vscode/extensions.json", ".vscode/launch.json", ".env"].map(
	copyFromDefault
);
