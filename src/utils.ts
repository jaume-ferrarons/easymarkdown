'use strict';

import * as vscode from 'vscode';

/**
 * Toggles the markdown pattern surrounding the selected word
 * @param editor Instance of the current editor
 * @param selection Selection in the text to process
 * @param pattern Patter to add or remove
 */
export function makeToggle(editor: vscode.TextEditor, selection: vscode.Selection, pattern: string): void {
    const text = editor.document.getText(selection);
    const { character: startChar, line: startLine } = selection.start;
    const { character: endChar, line: endLine } = selection.end;
    const pLen = pattern.length;

    const before = startChar > pLen - 1 && editor.document.getText(new vscode.Range(
        new vscode.Position(startLine, startChar - pLen),
        new vscode.Position(startLine, startChar)));

    const startsWith = startChar + pLen <= editor.document.lineAt(startLine).text.length &&
        editor.document.getText(new vscode.Range(
            new vscode.Position(startLine, startChar),
            new vscode.Position(startLine, startChar + pLen)));

    const endsWith = endChar > pLen - 1 &&
        editor.document.getText(new vscode.Range(
            new vscode.Position(endLine, endChar - pLen),
            new vscode.Position(endLine, endChar)));

    const after = endChar + pLen <= editor.document.lineAt(endLine).text.length &&
        editor.document.getText(new vscode.Range(
            new vscode.Position(endLine, endChar),
            new vscode.Position(endLine, endChar + pLen)));

    const add = before !== pattern && startsWith !== pattern;
    editor.edit((edit) => {
        if (add) {
            edit.replace(selection, `${pattern}${text || 'some text'}${pattern}`);
        } else {
            // Remove starting pattern
            if (before === pattern) {
                edit.delete(new vscode.Range(
                    new vscode.Position(startLine, startChar - pLen),
                    new vscode.Position(startLine, startChar)));
            } else if (startsWith === pattern) {
                edit.delete(new vscode.Range(
                    new vscode.Position(startLine, startChar),
                    new vscode.Position(startLine, startChar + pLen)));
            }
            // Remove ending pattern if exists
            if (after === pattern) {
                edit.delete(new vscode.Range(
                    new vscode.Position(endLine, endChar),
                    new vscode.Position(endLine, endChar + pLen)));
            } else if (endsWith === pattern) {
                edit.delete(new vscode.Range(
                    new vscode.Position(endLine, endChar - pLen),
                    new vscode.Position(endLine, endChar)));
            }
        }
    });
}