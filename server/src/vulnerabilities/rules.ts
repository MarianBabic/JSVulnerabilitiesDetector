import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import { Utils } from './utils';

// check for 'TODO' notes in the code
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
            'TODO should be resolved.',
            false,
            null,
            null
        );
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}

// check for '<script>...</script>' blocks of the code
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

            let rangeEnd: number;
            if (lines[i].includes(scriptCloseTag)) {
                rangeEnd = charsCount + lines[i].indexOf(scriptCloseTag) + scriptCloseTag.length;
            } else {
                let charsCountTemp = charsCount + lines[i].length + 1;
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].includes(scriptCloseTag)) {
                        rangeEnd = charsCountTemp + lines[j].indexOf(scriptCloseTag) + scriptCloseTag.length;
                        break;
                    }
                    charsCountTemp += lines[j].length + 1;
                }
            }
            if (!rangeEnd) {
                // if closing </script> tag is not found only opening <script> tag will be highlighted
                rangeEnd = rangeStart + scriptOpenTag.length;
            }

            const diagnostic: Diagnostic = Utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Consider using '<script>...</script>' block of the code carefully.`,
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                'Possible XSS vulnerability.'
            );
            diagnostics.push(diagnostic);

            problemsCount++;
            if (problemsCount == maxNumberOfProblems) {
                break;
            }
        }
        charsCount += lines[i].length + 1; // +1 to include \n newline character in counting too
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
        charsCount += lines[i].length + 1; // +1 to include \n newline character in counting too
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
        charsCount += lines[i].length; // +1 to include \n newline character in counting too
    }

    return diagnostics;
}

export function getAllRules(): Function[] {
    return [checkForTodos, checkForScriptStrings, checkForEval, checkForInnerOuterHtml];
}
