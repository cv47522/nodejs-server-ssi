const path = require('path');
const fs = require('fs');

const codeArrName = '__p__';
const directiveRegex = /<!--#\s*([^\r\n]+?)\s*-->/mg;
const includeRegex = /^\s*include\s+(file|virtual)=(['"])([^\r\n]+?)(['"])\s*(.*)/;
const echoReg = /\s*echo\s+var\s*=\s*['"]?([^'"]+)['"]?(\s+default\s*=\s*(['"][\w\W]*['"])\s*)?\s*/;


// 分割代码块
// ssi表达式和普通文本分离
// TODO: remove
function resolveRawHTML(rawHTML) {
    if(typeof rawHTML != 'string') {
        return rawHTML;
    }

    const breakdowns = [];
    let index = 0;

    const replacer = (match, expr, offsetIdx, rawString) => {
        if(offsetIdx > index) {
            breakdowns.push({
                // extract the content before the matching directive
                content: convertContent(rawString.substring(index, offsetIdx))
            });
        }
        // 运行表达式
        breakdowns.push({
            match: match,
            expression: expr,
            index: offsetIdx
        });
        // move index to the end of the matching directive
        index = offsetIdx + match.length;
    };

    // invoke a replace function
    rawHTML.replace(directiveRegex, replacer);

    // append the remaining contents (after the current directive but before the next one)
    if(index < rawHTML.length - 1) {
        breakdowns.push({
            content: convertContent(rawHTML.substring(index))
        });
    }
    return breakdowns;
}

// 把模板解析成可执行的js代码
// options {}   file 当前文件路径， root 当前根路径
async function decode(rawHTML, options) {
    options = options || {};
    return new Promise(async (resolve, reject) => {
        try {
            let codeBlocks = await convertToCode(rawHTML, options);
            let code = `if(typeof ${codeArrName}=='undefined'){var ${codeArrName}=[];} ${codeBlocks} return ${codeArrName}.join('');`;
            //console.log(code);
            resolve && resolve(code);
        }
        catch(err) {
            console.error(err);
            reject && reject(err);
        }
    });
}

/* Handle include directive */
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
                    const result = await convertToCode(data, optionsDict);
                    resolve && resolve(result);
                } catch(err) {
                    reject && reject(err);
                }

                // fs.readFile(innerFile, 'utf8', async (err, data) => {
                //     if(err) {
                //         reject && reject(err);
                //     }
                //     else {
                //         let opt = Object.assign({}, options, {file: innerFile});
                //         let ret = await convertToCode(data, opt);
                //         resolve && resolve(ret);
                //     }
                // });
                return;
            }
        }
        resolve && resolve(result);
    });
}

// TODO: remove
// 转换普通文本
function convertContent(content) {
    return content.replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$') // $符号需要处理，跟``取变量冲突
        .replace(/`/g, '\\`');
}

// 表达式转为代码
async function convertToCode(rawHTML, options) {
    const code = []; // 代码块

    // TODO: remove
    const breakdownsOfHTML = resolveRawHTML(rawHTML);

    if(!breakdownsOfHTML || !breakdownsOfHTML.length) return "";

    for(let part of breakdownsOfHTML) {
        if(!part) continue;
        if(part.content) {
            code.push(`${codeArrName}.push(\`${part.content}\`);`);
        }
        if(part.expression) {
            let block = await resolveDirective(part.expression, options);
            code.push(block);
        }
    }
    return code.join('\n');
}

/* Handle SSI directives */
async function resolveDirective(expression, options) {
    return new Promise(async (resolve, reject) => {
        // 对表达式转换成js对应的
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

module.exports = {
    decode
};