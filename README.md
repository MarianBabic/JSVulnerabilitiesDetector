# README

JS Vulnerabilities Detector is a VisualStudio Code extension which detects security vulnerabilities in JavaScript / Typescript code.

## Features

Detects and highlights suspicious and potentionally vulnerable code.

Rules:
- TODO notes
- 'script' code blocks
- 'eval' functions
- HTML rendering methods:
    1. element.innerHTML = "...";
    2. element.outerHTML = "...";
    3. document.write(...);
    4. document.writeln(...);

## Requirements

VS Code >= 1.31.0 

## Extension Settings

Following can be configured in Settings -> Extensions -> JS Vulnerabilities Detector:
- individual rules can be turned on/off - all are turned on by default
- max number of problems detected and reported - 100 by default
- tracing communication between VS Code and server - turned off by default

## Known Issues

None.

## Release Notes

### 0.2.0

Rules can be turned on/off in Settings.

### 0.1.0

First version demonstrating that this extension utilising language server detects and highlights suspicious and potentionally vulnerable code in Javascript and Typescript files.