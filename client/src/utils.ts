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
                if (element.code.toString() === 'jsvd-4' && document.getText(range).includes('.write(')) {
                    const escapeAssignedData = new WorkspaceEdit();
                    // TODO: make this function smarter :)
                    function getNewText(underlinedText: string): string {
                        const assignedData = underlinedText.substring(7, underlinedText.length - 2);
                        return `.write(escape(${assignedData}));`;
                    }
                    escapeAssignedData.replace(document.uri, range, getNewText(document.getText(range)));

                    result.push({
                        title: 'Escape assigned data',
                        kind: CodeActionKind.QuickFix,
                        edit: escapeAssignedData
                    });

                    // const makeUpperCase = new WorkspaceEdit();
                    // makeUpperCase.replace(document.uri, range, document.getText(range).toUpperCase());

                    // result.push({
                    //     title: 'Make UpperCase',
                    //     kind: CodeActionKind.QuickFix,
                    //     edit: makeUpperCase
                    // });
                }
            }
        })

        return result;
    }
}