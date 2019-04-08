import { CodeAction, CodeActionKind, CodeActionProvider, Diagnostic, WorkspaceEdit } from 'vscode';

// returns javascript and typescript documents
export function getDocumentSelector():
    string[]
    | (
        string | {
            language: string;
            scheme?: string;
            pattern?: string;
        }
        | {
            language?: string;
            scheme: string;
            pattern?: string;
        }
        | {
            language?: string;
            scheme?: string;
            pattern: string;
        }
    )[] {
    return [
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' }
    ]
}

export class JSVDCodeActionProvider implements CodeActionProvider {
    provideCodeActions(
        document: import("vscode").TextDocument,
        range: import("vscode").Range | import("vscode").Selection,
        context: import("vscode").CodeActionContext,
        token: import("vscode").CancellationToken): import("vscode").ProviderResult<(import("vscode").Command | import("vscode").CodeAction)[]> {

        const diagnosticsArray: Diagnostic[] = context.diagnostics;
        const result: CodeAction[] = [];

        diagnosticsArray.forEach(element => {
            if (element.code.toString().includes('jsvd-')) { // only jsvd diagnostics'
                if (element.code.toString() === 'jsvd-4') {
                    const edit = new WorkspaceEdit();
                    edit.replace(document.uri, range, `escape(${document.getText(range)})`);
                    // workspace.applyEdit(edit)

                    const makeUpperCase = new WorkspaceEdit();
                    makeUpperCase.replace(document.uri, range, document.getText(range).toUpperCase());

                    result.push({
                        title: 'Escape Input',
                        kind: CodeActionKind.QuickFix,
                        edit: edit
                    })

                    result.push({
                        title: 'Make UpperCase',
                        kind: CodeActionKind.QuickFix,
                        edit: makeUpperCase
                    })
                }
            }
        })

        return result;
    }
}