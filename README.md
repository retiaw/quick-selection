# Quick Selection

Insert the active Cursor editor selection's file-line reference into the integrated terminal for any agent CLI.

## Install Locally In Cursor

This project is intended for local Cursor installation.

From the repository root:

```sh
npm install
npm run install:cursor
```

This builds `quick-selection-0.1.0.vsix` and installs it into Cursor using Cursor's CLI.

You can also install the VSIX manually:

1. Run `npm run package`.
2. Open Cursor.
3. Run **Extensions: Install from VSIX...** from the command palette.
4. Select the generated `.vsix` file.

## Behavior

- Reads the current active editor selection range.
- Uses the active integrated terminal, or creates one when none exists.
- Shows and focuses the terminal panel.
- Sends only ` relative/path:startLine-endLine `.
- Adds one leading and one trailing space.
- Does not create temporary files.
- Does not use or modify the system clipboard.

Example terminal input:

```text
 src/example.ts:12-18 
```

The selected text itself is not pasted into the terminal. The inserted text is just a compact reference to the selected file and line range, which works naturally with agent CLIs that can read files from the current workspace.

Because this uses the real file path, the agent CLI reads the saved file from disk. Save the file first when the selected range includes unsaved edits.

## Verify

```sh
npm test
npm run package
```

## Default Keybinding

- macOS: `cmd+l`
- Windows/Linux: `ctrl+shift+enter`

The keybinding only applies when the editor is focused and text is selected.

## Build Only

```sh
npm install
npm run package
```

The generated VSIX can be copied to another machine and installed with Cursor's **Extensions: Install from VSIX...** command.

## Why Not Only `keybindings.json`?

VS Code/Cursor keybindings can call existing commands, but they cannot compute the active editor's file path and selected line range, focus the active terminal, and insert the resulting reference without extension code.

Clipboard-based workarounds are possible, but they overwrite the user's clipboard. Existing terminal commands such as running selected text may also execute the command instead of only placing it in the input line. This extension avoids both issues by using the extension API directly.
