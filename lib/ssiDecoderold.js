const fs = require('fs');
const path = require('path');

const ssiUtils = require('./ssiUtils');
const ssiDirectiveHandler = require('./ssiDirectiveHandler');

// directiveRegexWithSpace: e.g., <!-- #include file="path" -->
const directiveRegexWithSpace = /<!--[ ]*#([a-z]+)([ ]+([a-z]+)="(.+?)")*[ ]*-->/g;
// directiveRegexWithoutSpace: e.g., <!--#include file="path" -->
const directiveRegexWithoutSpace = /<!--#([a-z]+)([ ]+([a-z]+)="(.+?)")* -->/g;

// e.g., <!--#include file="path"--> or  <!--#include file="path" -->
// /<!--#\s*([^\r\n]+?)\s*-->/mg;
// const includeReg = /^\s*include\s+(file|virtual)=(['"])([^\r\n]+?)(['"])\s*(.*)/;

class ssiDecoder {
    constructor(inputDir) {
        this.inputDir = inputDir;
        this.docRoot = inputDir;
        // this.outputDir = outputDir;
        // this.matcher = matcher;
        this.directiveRegex = directiveRegexWithoutSpace;

        this.ssiDirectiveHandler = new ssiDirectiveHandler(this.docRoot, this.directiveRegex);
        this.ssiDirectiveHandler.parser = this;
    }

    parse(filename, contents) {
        const instance = this;

        contents = contents.replace(new RegExp(instance.directiveRegex), (directive, directiveName) => {
            const data = instance.ssiDirectiveHandler.handleDirective(directive, directiveName, filename);

            if (data.error) throw data.error;

            for (let key in data.variables) {
                if (data.variables.hasOwnProperty(key)) {
                    variables[data.variables[key].name] = data.variables[key].value;
                }
            }
            return (data && data.output) || "";
        });
        return {contents: contents};
    }
}

module.exports = ssiDecoder;