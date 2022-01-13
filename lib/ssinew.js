const fs = require('fs');
const path = require('path');
// const glob = require('glob');

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
    constructor(inputDir, outputDir, matcher, loosenedSpace) {
        this.inputDir = inputDir;
        this.docRoot = inputDir;
        // this.outputDir = outputDir;
        this.matcher = matcher;
        this.directiveRegex = directiveRegexWithoutSpace;

        this.ssiUtils = new ssiUtils(this.docRoot);
        this.ssiDirectiveHandler = new ssiDirectiveHandler(this.ssiUtils, this.directiveRegex);
        this.ssiDirectiveHandler.parser = this;
    }

    // compile() {
    //     const files = glob.sync(this.inputDir + this.matcher);

    //     for (let i=0; i<files.length; i++) {
    //         let input = files[i];
    //         let contents = fs.readFileSync(input, {encoding: "utf8"});
    //         let data = this.parse(input, contents);

    //         let output = input.replace(this.inputDir, this.outputDir);
    //         this.ssiUtils.writeFileSync(output, data.contents);
    //     }
    // }

    parse(filename, contents, variables) {
        const instance = this;
        variables = variables || {};

        contents = contents.replace(new RegExp(instance.directiveRegex), (directive, directiveName) => {
            const data = instance.ssiDirectiveHandler.handleDirective(directive, directiveName, filename, variables);

            if (data.error) throw data.error;

            for (let key in data.variables) {
                if (data.variables.hasOwnProperty[key]) {
                    variables[data.variables[key].name] = data.variables[key].value;
                }
            }
            return (data && data.output) || "";
        });
        return {contents: contents, variables: variables};
    }
}

module.exports = ssiDecoder;