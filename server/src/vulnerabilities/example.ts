import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';
import { Utils } from './utils';

export function validateDocument(
    textDocument: TextDocument,
    settings: ExampleSettings,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    // check for all uppercase words length 2 and more
    let text = textDocument.getText();
    let pattern = /\b[A-Z]{2,}\b/g;
    let m: RegExpExecArray | null;

    let problems = 0;
    let diagnostics: Diagnostic[] = [];

    while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        problems++;
        const rangeStart = m.index;
        const rangeEnd = rangeStart + m[0].length;
        const diagnostic = Utils.getDiagnostic(
            DiagnosticSeverity.Warning,
            textDocument.positionAt(rangeStart),
            textDocument.positionAt(rangeEnd),
            `${m[0]} is all uppercase.`,
            hasDiagnosticRelatedInformationCapability,
            textDocument.uri,
            'Spelling matters.'
        );
        diagnostics.push(diagnostic);
    }

    // check for TODO strings

    const lines: string[] = text.split('\n');

    let charsCount: number = 0;
    for (let i = 0; i < lines.length; i++) {
        const todoString = 'TODO';

        if (lines[i].includes(todoString)) {
            const rangeStart = charsCount + lines[i].indexOf(todoString);
            const rangeEnd = rangeStart + todoString.length;
            const diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `${todoString} should be resolved.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `${todoString} needs your attention.`
            );
            diagnostics.push(diagnostic);
        }

        charsCount += lines[i].length;
        charsCount += 1; // counting \n newline character too
    }

    return diagnostics;
}