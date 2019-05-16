# README

JS Vulnerabilities Detector is a Visual Studio Code extension which detects security vulnerabilities in JavaScript / Typescript code. As you open a JS or TS file and start writing code, it scans the file and highlights suspicious and potentially vulnerable code. Detected vulnerabilities are also listed in the ''Problems' tab. Quick fixes are offered to relevant issues.

## Features

These potential vulnerabilities are detected:
- 'eval(...)' functions
- HTML rendering methods:
    1. document.write('...');
    2. document.writeln('...');
    3. element.innerHTML = '...';
    4. element.outerHTML = '...';
- 'script' code blocks
- TODO notes

Quick fixes offered to relevant issues:
- document.write('...') -> document.write(escape('...'))
- document.writeln('...') -> document.writeln(escape('...'))
- element.innerHTML = '...' -> element.innerText = '...' or element.textContent = '...'

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

### 0.3.0

Quick fixes as code actions for some of the detected vulnerabilities implemented.

### 0.2.0

Individual rules can be turned on/off in Settings.

### 0.1.0

Alpha version.