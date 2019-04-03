import { Diagnostic, DiagnosticSeverity, Position } from 'vscode-languageserver';

export interface JSVulnerabilitiesDetectorSettings {
    maxNumberOfProblems: number;
    todoNotes: boolean,
    scriptCodeBlocks: boolean,
    evalFunctions: boolean,
    htmlRenderingMethods: boolean
}

export function getDiagnostic(
    severity: DiagnosticSeverity,
    rangeStart: Position,
    rangeEnd: Position,
    messageMain: string,
    hasDiagnosticRelatedInformationCapability: boolean,
    uri: string,
    messageRelated: string) {

    let diagnostic: Diagnostic = {
        severity: severity,
        range: {
            start: rangeStart,
            end: rangeEnd
        },
        message: messageMain,
        source: 'JS Vulnerabilities Detector'
    };

    if (hasDiagnosticRelatedInformationCapability) {
        diagnostic.relatedInformation = [
            {
                location: {
                    uri: uri,
                    range: Object.assign({}, diagnostic.range)
                },
                message: messageRelated
            }
        ];
    }

    return diagnostic;
}