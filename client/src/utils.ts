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
                const innerHtmlStart = '.innerHTML';
                const writeStart = '.write(';
                const writeLnStart = '.writeln(';

                if (element.code.toString() === 'jsvd-2' && document.getText(range).includes(innerHtmlStart)) {
                    const replaceWithInnerText = new WorkspaceEdit();
                    replaceWithInnerText.replace(document.uri, range, '.innerText');

                    const replaceWithTextContent = new WorkspaceEdit();
                    replaceWithTextContent.replace(document.uri, range, '.textContent');

                    result.push(
                        {
                            title: 'Replace .innerHTML with .innerText',
                            kind: CodeActionKind.QuickFix,
                            edit: replaceWithInnerText
                        },
                        {
                            title: 'Replace .innerHTML with .textContent',
                            kind: CodeActionKind.QuickFix,
                            edit: replaceWithTextContent
                        }
                    );
                }

                if (element.code.toString() === 'jsvd-2'
                    && (document.getText(range).includes(writeStart) || document.getText(range).includes(writeLnStart))
                ) {
                    const escapeAssignedData = new WorkspaceEdit();
                    function getNewText(underlinedText: string): string {
                        if (document.getText(range).includes(writeStart)) {
                            const assignedData = underlinedText.substring(writeStart.length, underlinedText.length - 2);
                            return `.write(escape(${assignedData}));`;
                        } else {
                            const assignedData = underlinedText.substring(writeLnStart.length, underlinedText.length - 2);
                            return `.writeln(escape(${assignedData}));`;
                        }
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