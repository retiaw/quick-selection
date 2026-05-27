"use strict";

const assert = require("assert");
const Module = require("module");
const os = require("os");
const path = require("path");
const fs = require("fs");

const workspacePath = fs.mkdtempSync(path.join(os.tmpdir(), "quick-selection-test-"));
const sourcePath = path.join(workspacePath, "sample.ts");
const selectedText = [
  "  const message = `hello ${name}`;",
  "  return message.toUpperCase();",
].join("\n");

fs.writeFileSync(
  sourcePath,
  [
    "function greet(name: string) {",
    selectedText,
    "}",
    "",
  ].join("\n")
);

const document = {
  fileName: sourcePath,
  uri: {
    scheme: "file",
    fsPath: sourcePath,
    path: sourcePath,
    toString() {
      return `file://${sourcePath}`;
    },
  },
};

const editor = {
  document,
  selection: {
    isEmpty: false,
    start: { line: 1, character: 2 },
    end: { line: 3, character: 0 },
  },
};

let commandCallback;
let sentText;
let sentAddNewLine;

const vscodeMock = {
  commands: {
    registerCommand(command, callback) {
      assert.ok(
        command === "quickSelection.insert" ||
          command === "selectionReferenceToTerminal.insert" ||
          command === "quickPasteSelectionToTerminal"
      );
      commandCallback = callback;
      return { dispose() {} };
    },
  },
  window: {
    activeTextEditor: editor,
    activeTerminal: {
      show() {},
      sendText(text, addNewLine) {
        sentText = text;
        sentAddNewLine = addNewLine;
      },
    },
    createTerminal() {
      throw new Error("test should use the active terminal");
    },
    showInformationMessage(message) {
      throw new Error(`unexpected info message: ${message}`);
    },
    showErrorMessage(message) {
      throw new Error(`unexpected error message: ${message}`);
    },
  },
  workspace: {
    getWorkspaceFolder(uri) {
      assert.strictEqual(uri.fsPath, sourcePath);
      return {
        uri: {
          scheme: "file",
          fsPath: workspacePath,
        },
      };
    },
  },
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "vscode") {
    return vscodeMock;
  }

  return originalLoad.call(this, request, parent, isMain);
};

const extension = require("../extension");

const payload = extension.buildTerminalPayload(editor);

assert.strictEqual(payload, " sample.ts:2-3 ");
assert.ok(!payload.includes(selectedText), "terminal payload should not display selected text");
assert.ok(!fs.existsSync(path.join(workspacePath, ".codex")), "test should not create context files");

const context = { subscriptions: [] };
extension.activate(context);
assert.strictEqual(context.subscriptions.length, 3);
commandCallback();

assert.strictEqual(sentAddNewLine, false);
assert.strictEqual(sentText, " sample.ts:2-3 ");
assert.ok(!sentText.includes(selectedText), "sent terminal text should not include selected text");

console.log("All tests passed");
