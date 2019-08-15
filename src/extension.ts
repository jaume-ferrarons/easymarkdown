'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { makeToggle } from './utils';

function toggleBold(editor: vscode.TextEditor, selection: vscode.Selection): void {
    makeToggle(editor, selection, '**');
}

function toggleItalic(editor: vscode.TextEditor, selection: vscode.Selection): void {
    makeToggle(editor, selection, '_');
}

function toggleStrikethrough(editor: vscode.TextEditor, selection: vscode.Selection): void {
    makeToggle(editor, selection, '~~');
}

function toLink(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    editor.edit((edit) => {
        edit.replace(selection, `[${text || 'link description'}](http://url.here)`);
    });
}

function toTable(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const text = editor.document.getText(selection);
    const table = text.split("\n").filter((line) => line.trim().length > 0).map((line) => {
        return line.split(/\s\s+|\t/g);
    });
    const columnSizes: Array<number> = [];
    table.forEach((row) => row.forEach((elem, index) => columnSizes[index] = Math.max(columnSizes[index] || 0, elem.length)));
    console.log({ columnSizes });
    const lines = table.map((row) => row.map((elem, index) => elem.padStart(columnSizes[index])).join(" | ")).map((line) => `| ${line} |`);
    let separator = "|" + columnSizes.map((size) => "-".repeat(size + 2)).join("|") + "|";
    lines.splice(1, 0, separator);
    editor.edit((edit) => {
        edit.replace(selection, lines.join("\n"));
    });
}

function toggleListItem(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    const add = !editor.document.lineAt(startLine).text.startsWith('* ');
    editor.edit((edit) => {
        for (let nLine = startLine; nLine <= endLine; nLine++) {
            const line = editor.document.lineAt(nLine).text;
            const isItem = line.startsWith('* ');
            if (add && !isItem) {
                edit.insert(new vscode.Position(nLine, 0), '* ');
            } else if (!add && isItem) {
                edit.delete(new vscode.Range(new vscode.Position(nLine, 0), new vscode.Position(nLine, 2)));
            }
        }
    });
}

function toggleNumberedListItem(editor: vscode.TextEditor, selection: vscode.Selection): void {
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    const numberRe = /^\d+\. /;
    const add = !numberRe.test(editor.document.lineAt(startLine).text);
    let indexOffset = 1;
    if (add && startLine > 0) { // Get number from previous line
        const prevLine = editor.document.lineAt(startLine - 1).text;
        if (numberRe.test(prevLine)) {
            indexOffset = parseInt(prevLine.split('.', 1)[0], 10) + 1;
        }
    }
    editor.edit((edit) => {
        for (let nLine = startLine; nLine <= endLine; nLine++) {
            const line = editor.document.lineAt(nLine).text;
            const isItem = numberRe.test(line);
            if (isItem) {
                let numberLength = line.split('.', 1)[0].length;
                edit.delete(new vscode.Range(new vscode.Position(nLine, 0), new vscode.Position(nLine, numberLength + 2)));
            }
            if (add) {
                edit.insert(new vscode.Position(nLine, 0), `${nLine - startLine + indexOffset}. `);
            }
        }
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const commands = [
        { name: 'bold', handler: toggleBold },
        { name: 'italic', handler: toggleItalic },
        { name: 'strikethrough', handler: toggleStrikethrough },
        { name: 'link', handler: toLink },
        { name: 'item', handler: toggleListItem },
        { name: 'numberedList', handler: toggleNumberedListItem },
        { name: 'table', handler: toTable }
    ];

    commands.forEach(command => {
        context.subscriptions.push(vscode.commands.registerCommand(`extension.${command.name}`, () => {
            let editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return; // No open text editor
            }
            let selection = editor.selection;
            command.handler(editor, selection);
        }));
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}