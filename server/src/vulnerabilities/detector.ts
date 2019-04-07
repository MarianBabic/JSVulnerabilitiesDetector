import { Diagnostic, TextDocument, CodeAction, CodeActionKind, CodeActionParams, Command, DiagnosticSeverity, CodeActionContext, Range, TextDocumentIdentifier, Position } from 'vscode-languageserver';
import { JSVulnerabilitiesDetectorSettings, getDiagnostic } from './utils';
import * as rules from './rules';

export function validateDocument(
    textDocument: TextDocument,
    settings: JSVulnerabilitiesDetectorSettings,
    hasDiagnosticRelatedInformationCapability: boolean): Diagnostic[] {

    let diagnostics: Diagnostic[] = [];
    let diagnosticsTemp: Diagnostic[] = [];
    let text: string = textDocument.getText();
    let problemsCount: number = 0;
    const maxNumberOfProblems: number = settings.maxNumberOfProblems;

    const rulesArr: Function[] = rules.getApplicableRules(settings);
    for (const rule of rulesArr) {
        diagnosticsTemp = rule(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;

        if (problemsCount == maxNumberOfProblems) {
            break;
        }
    }

    return diagnostics;
}

export function getCodeActions(params: CodeActionParams): (Command | CodeAction)[] {
    const context: CodeActionContext = params.context;
    const range: Range = params.range;
    const textDocument: TextDocumentIdentifier = params.textDocument;

    const diagnosticsArray: Diagnostic[] = context.diagnostics;
    const only: string[] = context.only;
    const start: Position = range.start;
    const end: Position = range.end;
    const uri: string = textDocument.uri;

    const result: CodeAction[] = [];

    diagnosticsArray.forEach(element => {
        if (element.code.toString().includes('jsvd-')) { // only jsvd diagnostics'
            if (element.code === 'jsvd-4') {
                result.push(
                    {
                        title: 'Escape whole input',
                        kind: CodeActionKind.QuickFix,
                    }
                )
                result.push(
                    {
                        title: 'Ignore vulnerable part of the input',
                        kind: CodeActionKind.QuickFix,
                    }
                )
            }
        }
    });

    return result;
}