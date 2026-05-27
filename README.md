# Quick Selection

Insert the active Cursor editor selection's file-line reference into the integrated terminal for any agent CLI.

## Install From Cursor

Quick Selection is published as `retiaw.quick-selection`.

In Cursor:

1. Open Extensions.
2. Search for `Quick Selection` or `quick-selection`.
3. Install the extension named **Quick Selection**.

Cursor syncs extensions from Open VSX. If the listing does not appear immediately after a new release, search again later or install the `.vsix` from the GitHub release.

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

## Install Locally

```sh
npm install
npm run package
```

Then install the generated `.vsix` file in Cursor.

## Why Not Only `keybindings.json`?

VS Code/Cursor keybindings can call existing commands, but they cannot compute the active editor's file path and selected line range, focus the active terminal, and insert the resulting reference without extension code.

Clipboard-based workarounds are possible, but they overwrite the user's clipboard. Existing terminal commands such as running selected text may also execute the command instead of only placing it in the input line. This extension avoids both issues by using the extension API directly.
