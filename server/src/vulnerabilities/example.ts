import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';
import { Utils } from './utils';

export function validateDocument(
    textDocument: TextDocument,
    settings: ExampleSettings,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let text = textDocument.getText();
    let diagnostics: Diagnostic[] = [];
    let problems = 0;

    // check for TODOs
    let pattern = /TODO/g;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        problems++;
        const rangeStart = m.index;
        const rangeEnd = rangeStart + m[0].length;
        const diagnostic = Utils.getDiagnostic(
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

    // check for '<script>...</script>' strings
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;
    for (let i = 0; i < lines.length; i++) {
        const scriptOpenTag = '<script>';
        const scriptCloseTag = '</script>';
        if (lines[i].includes(scriptOpenTag) && problems < settings.maxNumberOfProblems) {
            problems++;
            const rangeStart = charsCount + lines[i].indexOf(scriptOpenTag);
            const rangeEnd = rangeStart + lines[i].indexOf(scriptCloseTag) + 1;
            const diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Consider using ${scriptOpenTag} tag carefully.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `Possible XSS vulnerability.`
            );
            diagnostics.push(diagnostic);
        }
        charsCount += lines[i].length;
        charsCount += 1; // counting \n newline character too
    }

    return diagnostics;
}