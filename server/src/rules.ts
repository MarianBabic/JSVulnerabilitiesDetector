import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';
import * as utils from './utils';

// check for 'eval' functions
function checkForEval(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;
    const evalStart: string = 'eval(';

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(evalStart) && [undefined, ' '].includes(lines[i][lines[i].indexOf(evalStart) - 1])) {
            const rangeStart: number = charsCount + lines[i].indexOf(evalStart);
            const rangeEnd: number = rangeStart + evalStart.length;
            const diagnostic: Diagnostic = utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                'Beware of the data inserted into EVAL function.',
                '1',
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                'Possible Injection and XSS vulnerability if untrusted data are inserted.'
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

/**
 * check for HTML rendering methods:
 * 1. element.innerHTML = '...';
 * 2. element.outerHTML = '...';
 * 3. document.write('...');
 * 4. document.writeln('...');
 * */
function checkForHtmlRenderingMethods(
    text: string,
    problemsCount: number,
    maxNumberOfProblems: number,
    textDocument: TextDocument,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    const lines: string[] = text.split('\n');
    let charsCount: number = 0;
    const innerHtmlStart = '.innerHTML';
    const outerHtmlStart = '.outerHTML';
    const writeStart = '.write(';
    const writeLnStart = '.writeln(';

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(innerHtmlStart) || lines[i].includes(outerHtmlStart) || (lines[i].includes(writeStart) && !lines[i].includes(writeStart + 'escape(')) || lines[i].includes(writeLnStart)) {
            let rangeStart: number = charsCount;
            let rangeEnd: number;

            if (lines[i].includes(innerHtmlStart)) {
                rangeStart += lines[i].indexOf(innerHtmlStart);
                rangeEnd = rangeStart + innerHtmlStart.length;
            } else if (lines[i].includes(outerHtmlStart)) {
                rangeStart += lines[i].indexOf(outerHtmlStart);
                rangeEnd = rangeStart + outerHtmlStart.length;
            } else if (lines[i].includes(writeStart)) {
                rangeStart += lines[i].indexOf(writeStart);
                // rangeEnd = rangeStart + writeStart.length;
                rangeEnd = charsCount + lines[i].length; // to the end of current line
            } else if (lines[i].includes(writeLnStart)) {
                rangeStart += lines[i].indexOf(writeLnStart);
                // rangeEnd = rangeStart + writeLnStart.length;
                rangeEnd = charsCount + lines[i].length; // to the end of current line
            }

            const diagnostic: Diagnostic = utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                'Beware of the data inserted into this function.',
                '2',
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                'Possible XSS vulnerability if untrusted data are inserted.'
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
        const diagnostic: Diagnostic = utils.getDiagnostic(
            DiagnosticSeverity.Warning,
            textDocument.positionAt(rangeStart),
            textDocument.positionAt(rangeEnd),
            'Resolve the TODO.',
            '3',
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
    const scriptOpenTag: string = '<script>';
    const scriptCloseTag: string = '</script>';

    for (let i = 0; i < lines.length; i++) {
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

            const diagnostic: Diagnostic = utils.getDiagnostic(
                DiagnosticSeverity.Warning,
                textDocument.positionAt(rangeStart),
                textDocument.positionAt(rangeEnd),
                `Beware of the data inserted into '<script>...</script>' block of the code.`,
                '4',
                hasDiagnosticRelatedInformationCapability,
                textDocument.uri,
                `Possible XSS vulnerability if untrusted data are inserted.`
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

// returns array of functions for rules which are turned on in Settings
export function getApplicableRules(settings: utils.JSVulnerabilitiesDetectorSettings): Function[] {
    let rules: Function[] = [];

    if (settings.evalFunctions) {
        rules.push(checkForEval);
    }
    if (settings.htmlRenderingMethods) {
        rules.push(checkForHtmlRenderingMethods);
    }
    if (settings.scriptCodeBlocks) {
        rules.push(checkForScriptStrings);
    }
    if (settings.todoNotes) {
        rules.push(checkForTodos);
    }

    return rules;
}
