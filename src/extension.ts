import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {

    /* ---------------------------------------------------------
       MAIN COMMAND: RUN SHELL COMMAND AND INSERT OUTPUT
    --------------------------------------------------------- */
    const runCmd = vscode.commands.registerCommand('insertCommandOutput.run', async () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const command = await askForCommand(context);
        if (!command) {
            return;
        }

        pushHistory(context, command);

        const remote = vscode.env.remoteName;
        const platform = os.platform();

        const config = vscode.workspace.getConfiguration("insertCommandOutput");
        const stderrBehavior = config.get<string>("stderrBehavior", "message");

        let shell: string | undefined = undefined;

        if (remote === "wsl" || platform === "linux") {
            shell = config.get<string>("defaultShell.linux", "/bin/bash");
        } else if (platform === "win32") {
            shell = config.get<string>("defaultShell.windows", "cmd.exe");
        }


        exec(command, { shell }, (error, stdout, stderr) => {

            if (stderr) {
                if (stderrBehavior === "message") {
                    vscode.window.showErrorMessage(stderr);
                } else if (stderrBehavior === "insert") {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, stderr);
                    });
                }
            }

            if (stdout) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, stdout);
                });
            }

            if (error && stderrBehavior === "ignore") {
                return;
            }
        });
    });

    /* ---------------------------------------------------------
       CLEAR HISTORY COMMAND
    --------------------------------------------------------- */
    const clearHistoryCmd = vscode.commands.registerCommand('insertCommandOutput.clearHistory', async () => {
        await context.globalState.update("history", []);
        vscode.window.showInformationMessage("Insert Command Output: History cleared");
    });

    /* ---------------------------------------------------------
       WATCH FOR KEYBINDING SETTING CHANGES
    --------------------------------------------------------- */
    const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
        if (
            e.affectsConfiguration("insertCommandOutput.runKeybinding") ||
            e.affectsConfiguration("insertCommandOutput.clearHistoryKeybinding")
        ) {
            vscode.window.showInformationMessage(
                "Keybinding setting changed. Click to open Keyboard Shortcuts.",
                "Open"
            ).then(choice => {
                if (choice === "Open") {
                    vscode.commands.executeCommand("workbench.action.openGlobalKeybindings");
                }
            });
        }
    });

    context.subscriptions.push(runCmd, clearHistoryCmd, configWatcher);
}

export function deactivate() { }

/* ---------------------------------------------------------
   HISTORY MANAGEMENT
--------------------------------------------------------- */

function pushHistory(context: vscode.ExtensionContext, cmd: string) {
    const config = vscode.workspace.getConfiguration("insertCommandOutput");
    const size = config.get<number>("historySize", 10);

    const history = context.globalState.get<string[]>("history", []);
    const newHistory = [cmd, ...history.filter(c => c !== cmd)].slice(0, size);

    context.globalState.update("history", newHistory);
}

function getHistory(context: vscode.ExtensionContext): string[] {
    return context.globalState.get<string[]>("history", []);
}

/* ---------------------------------------------------------
   COMMAND PICKER (snippets + history + custom)
--------------------------------------------------------- */

async function askForCommand(context: vscode.ExtensionContext): Promise<string | undefined> {
    const config = vscode.workspace.getConfiguration("insertCommandOutput");

    const snippets = config.get<string[]>("snippets", []);
    const history = getHistory(context);

    const items: vscode.QuickPickItem[] = [
        { label: "Custom command...", description: "Enter a new command" },
        ...snippets.map(s => ({ label: s, description: "Snippet" })),
        ...history.map(h => ({ label: h, description: "History" }))
    ];

    const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a command or choose 'Custom command...'"
    });

    if (!pick) return;

    if (pick.label === "Custom command...") {
        return vscode.window.showInputBox({ prompt: "Enter shell command" });
    }

    return pick.label;
}
