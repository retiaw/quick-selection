"use strict";

const path = require("path");
const vscode = require("vscode");

const COMMAND_ID = "quickSelection.insert";
const LEGACY_COMMAND_IDS = [
  "selectionReferenceToTerminal.insert",
  "quickPasteSelectionToTerminal",
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand(COMMAND_ID, insertSelectionReference);
  const legacyDisposables = LEGACY_COMMAND_IDS.map((commandId) =>
    vscode.commands.registerCommand(commandId, insertSelectionReference)
  );

  context.subscriptions.push(disposable, ...legacyDisposables);
}

function insertSelectionReference() {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.selection.isEmpty) {
    vscode.window.showInformationMessage("No text selected");
    return;
  }

  const terminal =
    vscode.window.activeTerminal ||
    vscode.window.createTerminal("Quick Selection Terminal");

  terminal.show(false);

  try {
    terminal.sendText(buildTerminalPayload(editor), false);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to prepare selection reference: ${getErrorMessage(error)}`
    );
  }
}

/**
 * @param {vscode.TextEditor} editor
 */
function buildTerminalPayload(editor) {
  const { startLine, endLine } = getSelectedLineRange(editor.selection);
  const filePath = getDocumentReferencePath(editor.document);

  return ` ${filePath}:${startLine}-${endLine} `;
}

/**
 * @param {vscode.Selection} selection
 */
function getSelectedLineRange(selection) {
  const startLine = selection.start.line + 1;
  const endLine =
    selection.end.character === 0 && selection.end.line > selection.start.line
      ? selection.end.line
      : selection.end.line + 1;

  return { startLine, endLine };
}

/**
 * @param {vscode.TextDocument} document
 */
function getDocumentReferencePath(document) {
  if (document.uri.scheme !== "file") {
    throw new Error("Current document is not backed by a local file");
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

  if (workspaceFolder && workspaceFolder.uri.scheme === "file") {
    const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);

    if (relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
      return relativePath;
    }
  }

  return document.uri.fsPath;
}

/**
 * @param {unknown} error
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  buildTerminalPayload,
  insertSelectionReference,
  getDocumentReferencePath,
  getSelectedLineRange,
};
