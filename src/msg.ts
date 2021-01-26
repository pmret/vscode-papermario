import * as vscode from 'vscode';

const noCloseTags: string[] = [
    "raw",
    "func",
    "br",
    "prompt",
    "sleep",
    "next",
    "style",
    "kerning",
    "scroll",
    "speed",
    "pos",
    "indent",
    "down",
    "up",
    "image",
    "sprite",
    "item",
    "cursor",
    "option",
    "choice",
    "choicecount",
    "cancel",
    "var",
    "center",
    "volume",
    "a",
    "b",
    "l",
    "r",
    "z",
    "c-up",
    "c-down",
    "c-left",
    "c-right",
    "start",
    "note",
    "heart",
    "star",
    "arrow-up",
    "arrow-down",
    "arrow-left",
    "arrow-right",
    "circle",
    "cross",
    "wait",
    "pause",
];

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeTextDocument(event => {
        console.log(event.document.languageId);
        if (event.document.languageId === "papermariomsg") {
            insertAutoCloseTag(event);
        }
    });

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider("papermariomsg", {
        async provideCompletionItems(document, position, token, context) {
            return [
                "message",
                "color",
                "font",
                "noskip",
                "instant",
                "wavy",
                "shaky",
                "noise",
                "faded-shaky",
                "fade",
                "shout", "shrinking",
                "whisper", "growing",
                "scream", "shaky-size",
                "chortle", "wavy-size",
                "shadow",
                "sound",
                ...noCloseTags,
            ].map(tag => new vscode.CompletionItem(tag));
        },
    }, "["));
}

export function deactivate() {}

// Based on https://github.com/formulahendry/vscode-auto-close-tag
function insertAutoCloseTag(event: vscode.TextDocumentChangeEvent) {
    if (!event.contentChanges[0]) {
        return;
    }

    if (event.contentChanges[0].text !== "]") {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const config = vscode.workspace.getConfiguration("papermario", editor.document.uri);
    if (!config.get<boolean>("autoClosingTags", true)) {
        return;
    }

    const selection = editor.selection;
    const originalPosition = selection.start.translate(0, 1);

    const textLine = editor.document.lineAt(selection.start);
    const text = textLine.text.substring(0, selection.start.character + 1);
    const result = /\[([_a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^\[\]]*?[^\s/\[\]>=]+?)*?\s?(\/|\])$/.exec(text);

    if (result && (occurrenceCount(result[0], "\"") % 2 === 0)) {
        if (result[2] === "]") {
            if (noCloseTags.indexOf(result[1].toLowerCase()) === -1) {
                editor.edit((editBuilder) => {
                    editBuilder.insert(originalPosition, "[/" + result[1] + "]");
                }).then(() => {
                    editor.selection = new vscode.Selection(originalPosition, originalPosition);
                });
            }
        } else {
            if (textLine.text.length <= selection.start.character + 1 || textLine.text[selection.start.character + 1] !== ']') { // if not typing "/" just before "]", add the "]" after "/"
                editor.edit((editBuilder) => {
                    editBuilder.insert(originalPosition, "]");
                });
            }
        }
    }
}

function occurrenceCount(source: string, find: string): number {
    return source.split(find).length - 1;
}
