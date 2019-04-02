import { Diagnostic, TextDocument } from 'vscode-languageserver';
import { ExampleSettings } from '../server';
import * as rules from './rules';

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
        diagnosticsTemp = rules.checkForTodos(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = rules.checkForScriptStrings(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = rules.checkForEval(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    if (problemsCount < maxNumberOfProblems) {
        diagnosticsTemp = rules.checkForInnerOuterHtml(text, problemsCount, maxNumberOfProblems, textDocument, hasDiagnosticRelatedInformationCapability);
        diagnostics.push(...diagnosticsTemp);
        problemsCount += diagnosticsTemp.length;
    }

    return diagnostics;
}
