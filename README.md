# Read Shell

Run shell commands and read their output directly into your editor — inspired by Vim’s `:r!{cmd}`.

Read Shell is a minimal, cross‑platform VS Code extension that lets you execute shell commands and insert their output at the cursor position. Perfect for quick data inspection, code generation, debugging, or bringing external tools directly into your workflow.

---

## ✨ Features

- Run any shell command and insert its output into the active editor  
- Vim‑like behavior (`:r!{cmd}`)  
- Command history with configurable size  
- Custom command snippets  
- Configurable stderr handling:
  - ignore  
  - show as message  
  - insert into file  
- User‑configurable default shell (Windows & Linux/WSL)  
- Suggested keybindings (user‑controlled)

---

## ⚙️ Settings

| Setting | Description |
|--------|-------------|
| `insertCommandOutput.stderrBehavior` | How to handle stderr (`ignore`, `message`, `insert`) |
| `insertCommandOutput.historySize` | Number of recent commands to remember |
| `insertCommandOutput.snippets` | List of predefined command snippets |
| `insertCommandOutput.runKeybinding` | Suggested keybinding for running commands |
| `insertCommandOutput.clearHistoryKeybinding` | Suggested keybinding for clearing history |
| `insertCommandOutput.defaultShell.windows` | Default shell on Windows |
| `insertCommandOutput.defaultShell.linux` | Default shell on Linux/WSL |

---

## ⌨️ Suggested Keybindings

Add these to your `keybindings.json`:

```json
{
  "key": "ctrl+alt+r",
  "command": "insertCommandOutput.run",
  "when": "editorTextFocus"
},
{
  "key": "ctrl+alt+shift+r",
  "command": "insertCommandOutput.clearHistory",
  "when": "editorTextFocus"
}
```

---

## 🐚 Example

Running:

```
:r! ls -la
```

in Vim becomes:

```
Ctrl+Alt+R → "ls -la"
```

and the output is inserted directly into your file.

---

## 📦 Why Read Shell?

Because sometimes you just want to *pull the outside world into your buffer* without switching windows, opening terminals, or breaking your flow.  
Read Shell keeps that workflow alive inside VS Code — clean, minimal, predictable.

---

## 🧩 License

MIT
