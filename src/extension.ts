import * as vscode from 'vscode';

import * as msg from './msg';

export function activate(context: vscode.ExtensionContext) {
    msg.activate(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
    msg.deactivate();
}
