import { Diagnostic, DiagnosticSeverity, Position } from 'vscode-languageserver';

export const Utils = {

    getDiagnostic(
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

}