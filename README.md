# README

JS Vulnerabilities Detector is a VisualStudio Code extension which detects security vulnerabilities in JavaScript / Typescript code.

## Features

Detects and highlights suspicious and potentionally vulnerable code:
- TODO notes
- 'script' code blocks
- 'eval' functions
- HTML rendering methods:
    1. element.innerHTML = "...";
    2. element.outerHTML = "...";
    3. document.write(...);
    4. document.writeln(...);

## Requirements

TODO

## Extension Settings

TODO

## Known Issues

None.

## Release Notes

### 0.1.0

First version demonstrating that this extension utilising language server detects and highlights suspicious and potentionally vulnerable code in Javascript and Typescript files.