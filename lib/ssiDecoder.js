const path = require('path');
const fs = require('fs');

const jsCodeArrName = '__p__';
const directiveRegex = /<!--#\s*([^\r\n]+?)\s*-->/mg;
const includeRegex = /^\s*include\s+(file|virtual)=(['"])([^\r\n]+?)(['"])\s*(.*)/;
const echoRegex = /\s*echo\s+var\s*=\s*['"]?([^'"]+)['"]?(\s+default\s*=\s*(['"][\w\W]*['"])\s*)?\s*/;


/* Split rawHtml into normal contents and SSI directives */
function resolveRawHtml(rawHtml) {
    if(typeof rawHtml != 'string') {
        return rawHtml;
    }

    const breakdowns = [];
    let index = 0;

    const replacer = (match, expr, offsetIdx, rawString) => {
        // Add normal Html contents to content key
        if(offsetIdx > index) {
            breakdowns.push({
                // extract the content before the matching directive
                content: rawString.substring(index, offsetIdx)
            });
        }
        // Split and add ssi directives to multiple keys
        breakdowns.push({
            match: match,
            expression: expr,
            index: offsetIdx
        });
        // move index to the end of the matching directive
        index = offsetIdx + match.length;
    };

    // invoke a replace function
    rawHtml.replace(directiveRegex, replacer);

    // append the remaining contents (after the current directive but before the next one)
    if(index < rawHtml.length - 1) {
        breakdowns.push({
            content: rawHtml.substring(index)
        });
    }
    return breakdowns;
}

/* Handle #include directive */
function resolveInclude(matching, options) {
    return new Promise(async (resolve, reject) => {
        let result = '';
        // if matching has the fourth value (i.e., input file) for the file attribute.
        if(matching && matching.length > 3 && matching[3]) {
            let innerFile = matching[3];
            let parent = options.root || '';
            // convert the relative innerFile path to absolute
            if(innerFile.indexOf('.') === 0) {
                if(options.file) parent = path.dirname(options.file);
            }

            innerFile = path.join(parent, innerFile);

            // if innerFile exists
            if(fs.existsSync(innerFile)) {
                try {
                    const data = await fs.promises.readFile(innerFile, 'utf8');
                    /**
                     * clone multiple objects:
                     * replace the original value (e.g., index.shtml) of the "file" key
                     * with innerFile (e.g., header.shtml)
                     */
                    const optionsDict = Object.assign({}, options, {file: innerFile});
                    const result = await convertToJsCode(data, optionsDict);
                    resolve && resolve(result);
                } catch(err) {
                    reject && reject(err);
                }
                return;
            }
        }
        resolve && resolve(result);
    });
}


/* Convert rawHtml into JS code */
async function convertToJsCode(rawHtml, options) {
    const jsCode = [];
    const breakdownsOfHtml = resolveRawHtml(rawHtml);

    if(!breakdownsOfHtml || !breakdownsOfHtml.length) return "";

    for(let part of breakdownsOfHtml) {
        if(!part) continue;
        if(part.content) {
            jsCode.push(`${jsCodeArrName}.push(\`${part.content}\`);`);
        }
        if(part.expression) {
            let block = await resolveDirective(part.expression, options);
            jsCode.push(block);
        }
    }
    return jsCode.join('\n');
}

/* Handle SSI directives */
async function resolveDirective(expression, options) {
    return new Promise(async (resolve, reject) => {
        let matching = null;
        let result = '';

        switch(true) {
            // match include directive
            case !!(matching = expression.match(includeRegex)): {
                result = await resolveInclude(matching, options);
                break;
            }
        }
        resolve(result);
    });
}

/* Decode rawHtml to complete JS code */
async function decode(rawHtml, options) {
    options = options || {};
    return new Promise(async (resolve, reject) => {
        try {
            let jsCodeBlocks = await convertToJsCode(rawHtml, options);
            let completeJsCode = `if(typeof ${jsCodeArrName}=='undefined'){var ${jsCodeArrName}=[];} ${jsCodeBlocks} return ${jsCodeArrName}.join('');`;
            resolve && resolve(completeJsCode);
        }
        catch(err) {
            console.error(err);
            reject && reject(err);
        }
    });
}

module.exports = {
    decode
};