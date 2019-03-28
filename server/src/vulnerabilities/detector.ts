import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';
import { Utils } from './utils';

export function validateDocument(
    textDocument: TextDocument,
    settings: ExampleSettings,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    let text: string = textDocument.getText();
    let problemsCount: number = 0;
    const maxNumberOfProblems: number = settings.maxNumberOfProblems;

    if (problemsCount < maxNumberOfProblems) {
        const diagnostics1: Diagnostic[] = checkForTodos(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnostics1);
        problemsCount += diagnostics1.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        const diagnostics2: Diagnostic[] = checkForScriptStrings(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnostics2);
        problemsCount += diagnostics2.length;
    }

    return diagnostics;
}

// check for TODOs
function checkForTodos(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    let pattern: RegExp = /TODO/g;
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(text)) && problemsCount < maxNumberOfProblems) {
        problemsCount++;
        const rangeStart: number = m.index;
        const rangeEnd: number = rangeStart + m[0].length;
        const diagnostic: Diagnostic = Utils.getDiagnostic(
            DiagnosticSeverity.Warning,
            textDocument.positionAt(rangeStart),
            textDocument.positionAt(rangeEnd),
            `TODO should be resolved.`,
            hasDiagnosticRelatedInformationCapability,
            textDocument.uri,
            'TODO needs your attention.'
        );
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}

// check for '<script>...</script>' strings
function checkForScriptStrings(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;

    for (let i = 0; i < lines.length; i++) {
        const scriptOpenTag: string = '<script>';
        const scriptCloseTag: string = '</script>';
        if (lines[i].includes(scriptOpenTag)) {
            const rangeStart: number = charsCount + lines[i].indexOf(scriptOpenTag);
            const rangeEnd: number = rangeStart + lines[i].indexOf(scriptCloseTag) + 1;
            const diagnostic: Diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Consider using ${scriptOpenTag} tag carefully.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `Possible XSS vulnerability.`
            );
            diagnostics.push(diagnostic);

            problemsCount++;
            if (problemsCount == maxNumberOfProblems) {
                break;
            }
        }
        charsCount += lines[i].length;
        charsCount += 1; // counting \n newline character too
    }

    return diagnostics;
}