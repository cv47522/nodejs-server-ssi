const path = require('path');
const fs = require('fs');

const codeArrName = '__p__';
const syntaxReg = /<!--#\s*([^\r\n]+?)\s*-->/mg;
const includeFileReg = /^\s*include\s+(file|virtual)=(['"])([^\r\n]+?)(['"])\s*(.*)/;
const echoReg = /\s*echo\s+var\s*=\s*['"]?([^'"]+)['"]?(\s+default\s*=\s*(['"][\w\W]*['"])\s*)?\s*/;


// 分割代码块
// ssi表达式和普通文本分离
function resolveTemplate(tpl) {
    if(typeof tpl != 'string') {
        return tpl;
    }
    
    const tags = [];
    let index = 0;
    tpl.replace(syntaxReg, (m, r, i, src) => {
        if(i > index) {
            tags.push({
                content: convertContent(src.substring(index, i))
            });
        }
        // 运行表达式
        tags.push({
            match: m,
            expression: r,
            index: i
        });
        index = i + m.length;// 向前移到当前表达式结尾
    });
    
    // 如果最后还有未处理的，则也加进到模板里
    if(index < tpl.length - 1) {
        tags.push({
            content: convertContent(tpl.substr(index))
        });
    }
    return tags;
}

// 把模板解析成可执行的js代码
// options {}   file 当前文件路径， root 当前根路径
async function decode(tpl, options) {
    options = options || {};
    return new Promise(async (resolve, reject) => {
        try {            
            let codeBlocks = await convertToCode(tpl, options);
            let code = `if(typeof ${codeArrName}=='undefined'){var ${codeArrName}=[];} ${codeBlocks} return ${codeArrName}.join('');`;
            //console.log(code);
            resolve && resolve(code);
        }
        catch(e) {
            console.error(e);
            reject && reject(e);
        }
    });    
}

// 表达式转为代码
async function convertToCode(tpl, options) {
    const code = []; // 代码块
    const syntaxs = resolveTemplate(tpl);            
    if(!syntaxs || !syntaxs.length) return "";

    for(let l of syntaxs) {
        if(!l) continue;
        if(l.content) {
            code.push(`${codeArrName}.push(\`${l.content}\`);`);
        }
        if(l.expression) {
            let block = await resolveSyntax(l.expression, options);
            code.push(block);
        }
    }
    return code.join('\n');
}

// 处理ssi关健表达式
async function resolveSyntax(expression, options) {
    return new Promise(async (resolve, reject) => {
        // 对表达式转换成js对应的
        let m = null;
        let result = '';
        switch(true) {
            // include 文件模板
            case !!(m = expression.match(includeFileReg)): {
                result = await resolveInclude(m, options);
                break;
            }
        }
        resolve && resolve(result);
    });
}

// 处理include
function resolveInclude(m, options) {
    return new Promise(async (resolve, reject) => {
        let result = '';
        if(m && m.length > 3 && m[3]) {
            let file = m[3];
            let parent = options.root || '';
            // 用了相对路径，则相对于父路径
            if(file.indexOf('.') === 0) {
                if(options.file) parent = path.dirname(options.file);
            }
            // console.log(parent,file);
            file = path.join(parent, file);
            // console.log(file);
            if(fs.existsSync(file)) {
                fs.readFile(file, 'utf8', async (err, data) => {
                    if(err) {
                        reject && reject(err);
                    }
                    else {
                        let opt = Object.assign({}, options, {file: file});
                        let ret = await convertToCode(data, opt);
                        resolve && resolve(ret);
                    }
                });
                return;
            }
        }
        resolve && resolve(result);
    });
}

// 转换普通文本
function convertContent(content) {
    return content.replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$') // $符号需要处理，跟``取变量冲突
        .replace(/`/g, '\\`');
}

module.exports = {
    decode
};