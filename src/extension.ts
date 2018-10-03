'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function toBold(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    editor.edit((edit) => {
        edit.replace(selection, `**${text}**`);
    });
}

function toItalics(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    editor.edit((edit) => {
        edit.replace(selection, `*${text}*`);
    });
}

function toStrikethrough(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    editor.edit((edit) => {
        edit.replace(selection, `~~${text}~~`);
    });
}

function toLink(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    editor.edit((edit) => {
        edit.replace(selection, `[${text}](http://url.here)`);
    });
}

function toListItem(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const startLine = editor.selection.start.line;
    const endLine = editor.selection.end.line;
    editor.edit((edit) => {
        for (let line = startLine; line <= endLine; line++) {
            edit.insert(new vscode.Position(line, 0), '* ');
        }
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "easymarkdown" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);

    const commands = [
        { name: 'bold', handler: toBold },
        { name: 'italics', handler: toItalics },
        { name: 'strikethrough', handler: toStrikethrough},
        { name: 'link', handler: toLink },
        { name: 'item', handler: toListItem }
    ];

    commands.forEach(command => {
        context.subscriptions.push(vscode.commands.registerCommand(`extension.${command.name}`, () => {
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // No open text editor
            }
            let selection = editor.selection;
            command.handler(editor, selection);
        }));
    });

    // context.subscriptions.push(vscode.commands.registerCommand('extension.bold', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');

    //     let editor = vscode.window.activeTextEditor;
    //     if (!editor) {
    //         return; // No open text editor
    //     }

    //     let selection = editor.selection;
    //     let text = editor.document.getText(selection);
    //     editor.edit((edit) => {
    //         edit.replace(selection, `**${text}**`)
    //     });
    // }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}