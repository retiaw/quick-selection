"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const vsixPath = path.join(root, `${pkg.name}-${pkg.version}.vsix`);

if (!fs.existsSync(vsixPath)) {
  console.error(`Missing VSIX: ${vsixPath}`);
  console.error("Run `npm run package` first.");
  process.exit(1);
}

const cursorCommand = findCursorCommand();

if (!cursorCommand) {
  console.error("Could not find Cursor CLI.");
  console.error("Set CURSOR_CLI=/path/to/cursor and rerun `npm run install:cursor`.");
  process.exit(1);
}

const result = spawnSync(cursorCommand, ["--install-extension", vsixPath, "--force"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

function findCursorCommand() {
  const candidates = [
    process.env.CURSOR_CLI,
    "/Applications/Cursor.app/Contents/Resources/app/bin/cursor",
    "cursor",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes(path.sep) && fs.existsSync(candidate)) {
      return candidate;
    }

    if (!candidate.includes(path.sep) && commandExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${shellQuote(command)}`], {
    stdio: "ignore",
  });

  return result.status === 0;
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
