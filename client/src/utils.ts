import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    Command,
    Diagnostic,
    ProviderResult,
    Range,
    Selection,
    TextDocument,
    WorkspaceEdit
} from 'vscode';

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
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken): ProviderResult<(Command | CodeAction)[]> {

        const diagnosticsArray: Diagnostic[] = context.diagnostics;
        const isSingleLine: boolean = range.isSingleLine;
        const result: CodeAction[] = [];

        diagnosticsArray.forEach(element => {
            if (element.code.toString().includes('jsvd-')) { // only jsvd diagnostics'
                if (element.code.toString() === 'jsvd-4') {
                    const edit = new WorkspaceEdit();
                    edit.replace(document.uri, range, `escape(${document.getText(range)})`);

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