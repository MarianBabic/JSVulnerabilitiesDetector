import { Diagnostic, TextDocument, CodeAction, CodeActionKind, CodeActionParams, Command, CodeActionContext, Range, TextDocumentIdentifier, Position, WorkspaceEdit } from 'vscode-languageserver';
import { JSVulnerabilitiesDetectorSettings } from './utils';
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
