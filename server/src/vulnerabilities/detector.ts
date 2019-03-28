import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';
import { Utils } from './utils';

export function validateDocument(
    textDocument: TextDocument,
    settings: ExampleSettings,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    let diagnosticsTemp: Diagnostic[] = [];
    let text: string = textDocument.getText();
    let problemsCount: number = 0;
    const maxNumberOfProblems: number = settings.maxNumberOfProblems;

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = checkForTodos(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = checkForScriptStrings(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = checkForEval(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = checkForInnerOuterHtml(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
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

// check for 'eval' function
function checkForEval(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('eval')) {
            const rangeStart: number = charsCount + lines[i].indexOf('eval');
            const rangeEnd: number = rangeStart + lines[i].lastIndexOf(')') + 1;
            const diagnostic: Diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Consider using EVAL function carefully.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `Huge risk of XSS vulnerability here.`
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

// check for 'innerHTML' and 'outerHTML'
function checkForInnerOuterHtml(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('innerHTML') || lines[i].includes('outerHTML')) {
            const rangeStart: number = charsCount;
            const rangeEnd: number = rangeStart + lines[i].indexOf(';') + 1;
            const diagnostic: Diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Consider using this method carefully.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `InnerHTML/OuterHTML DOM methods can be dangerous if untrusted input is inserted.`
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