import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';

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
        let diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(m.index),
                end: textDocument.positionAt(m.index + m[0].length)
            },
            message: `${m[0]} is all uppercase.`,
            source: 'JS Vulnerabilities Detector'
        };
        if (hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [
                {
                    location: {
                        uri: textDocument.uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: 'Spelling matters'
                }
            ];
        }
        diagnostics.push(diagnostic);
    }

    // check for TODO strings

    const lines: string[] = text.split('\n');

    let charsCount: number = 0;
    for (let i = 0; i < lines.length; i++) {
        const todoString = 'TODO';

        if (lines[i].includes(todoString)) {
            let diagnostic: Diagnostic = {
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: textDocument.positionAt(charsCount + lines[i].indexOf(todoString)),
                    end: textDocument.positionAt(charsCount + lines[i].indexOf(todoString) + todoString.length)
                },
                message: `${todoString} should be resolved.`,
                source: 'JS Vulnerabilities Detector'
            };
            if (hasDiagnosticRelatedInformationCapability) {
                diagnostic.relatedInformation = [
                    {
                        location: {
                            uri: textDocument.uri,
                            range: Object.assign({}, diagnostic.range)
                        },
                        message: `${todoString} should be resolved and deleted.`
                    }
                ];
            }
            diagnostics.push(diagnostic);
        }

        charsCount += lines[i].length;
        charsCount += 1; // counting \n newline character too
    }

    return diagnostics;
}