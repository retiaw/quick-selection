# Changelog

## 0.1.0

- Rename the extension to Quick Selection.
- Rename the public command to `quickSelection.insert`.
- Keep previous command IDs registered as compatibility aliases.

## 0.0.7

- Rebrand around generic agent CLIs instead of Codex-specific usage.
- Rename the public command to `selectionReferenceToTerminal.insert`.
- Keep `quickPasteSelectionToTerminal` registered as a compatibility alias.

## 0.0.6

- Simplify terminal insertion to ` relative/path:startLine-endLine `.
- Remove prompt text, newlines, `@file`, and bracketed paste wrapping.

## 0.0.5

- Send Cursor selections to Codex CLI as native `@file` references.
- Include source line ranges as `Source: [file:start-end]`.
- Avoid temporary context files and clipboard usage.
- Use bracketed paste to avoid submitting multiline prompts line by line.
