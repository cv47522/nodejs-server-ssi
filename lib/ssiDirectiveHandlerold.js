const path = require('path');
const ssiUtils = require('./ssiUtils');

/**
 * ATTRIBUTE_MATCHER: e.g.,
 * input:  const directive = '<!--#include file="path" -->';
 * output: file="path"
 */
const ATTRIBUTE_MATCHER = /([a-z]+)="(.+?)"/g;
/**
 * INTERPOLATION_MATCHER: e.g.,
 * input:  ...file=${path}...
 * output: ${path}
 */
const INTERPOLATION_MATCHER = /\$\{(.+?)\}/g;

class ssiDirectiveHandler {
    constructor(docRoot, directiveRegex) {
        this.parser = undefined;
        // this.ssiUtils = new ssiUtils(docRoot);
        this.directiveRegex = directiveRegex;
    }
    /**
     * Public Methods
     */
    handleDirective(directive, directiveName, currentFile) {
        // [{name: "include", value: "filename.shtml"}]
        const attributes = this.parseAttributes(directive);

        // const interpolate = () => {
        //     for (let i=0; i<attributes.length; i++) {
        //         let attr = attributes[i];
        //         attr.name = this._interpolate(attr.name, variables, false);
        //         attr.value = this._interpolate(attr.value, variables, false);
        //     }
        // }

        switch (directiveName) {
            case "include":
                // interpolate.apply(this);
                return this.handleInclude(attributes, currentFile);
        }
        return {error: `Invalid directive #${directiveName}`};
    }
    /**
     * Private Methods
     */
    parseAttributes(directive) {
        let attributes = [];

        /** e.g.,
         * input: const directive = '<!--#include file="path" -->';
         * output: [ { name: 'file', value: 'path' } ]
         */
        directive.replace(ATTRIBUTE_MATCHER, (attribute, name, value) => {
            attributes.push({name: name, value: value})
        });
        return attributes;
    }

    // _interpolate(rawString, variables, shouldWrap) {
    //     let instance = this;
    //     return string.replace(INTERPOLATION_MATCHER, function(variable, variableName) {
    //         var value;
    
    //         // Either return the variable value or the original expression if it doesn't exist
    //         if (variables[variableName] !== undefined) {
    //             value = variables[variableName];
    //         } else if (process.env[variableName] !== undefined) {
    //             value = process.env[variableName];
    //         }
    
    //         if (value !== undefined) {
    //             if (shouldWrap) {
    //                 // Escape all double quotes and wrap the value in double quotes
    //                 return instance._wrap(variables[variableName]);
    //             }
    
    //             return value;
    //         }
    
    //         return variable;
    //     });
    // }

    handleInclude(attributes, currentFile) {
        // #include directive validation
        if (attributes.length != 1) {
            return {error: "Directive #include should contain only one file."};
        } else if (attributes[0].name != "file") {
            return {error: "Directive #include should contain a 'file' attribute."};
        }

        const attribute = attributes[0];
        const attributeName = attribute.name;
        const filename = attribute.value;
        // let results = {output: this.readFileSync(currentFile, filename)};
        let results = {output: ""};
        // Parse the contents of the file to handle SSI directives
        const parsed = this.parser.parse(this.resolveFullPath(currentFile, filename), results.output);

        results.output = parsed.contents;
        results.variables = [];

        for (let key in parsed.variables) {
            if (parsed.variables.hasOwnProperty(key)) {
                results.variables.push({
                    name: key,
                    value: parsed.variables[key]
                });
            }
        }
        return results;
    }

    resolveFullPath(currentFile, file) {
        return path.resolve(path.dirname(currentFile), file);
    }

    resolveFileSync(currentFile, includeFile) {
        const filename = this.resolveFullPath(currentFile, includeFile);
        return fs.readFileSync(filename, {encoding: "utf8"});
    }
};

module.exports = ssiDirectiveHandler;

