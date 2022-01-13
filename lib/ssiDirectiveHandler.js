const vm = require("vm");
const ssiDecoder = require('./ssiDecoder');


/**
 * rawHTML {string} 模板
 * options {object} 参数
 *      data 运行时参数
 *      root ssi执行根路径
 */

const ssiDirectiveHandler = (rawHTML, options) => {
    options = options || {};
    options.data = options.data || {};
    options.root = options.root || '';

    return new Promise(async (resolve, reject) => {
        try {
            const parsedHTMLwithFunctions = await ssiDecoder.decode(rawHTML, options);
            const result = generateHTML(parsedHTMLwithFunctions, options.data);
            resolve(result);
        } catch(err) {
            reject(err);
        }

        // ssiDecoder.decode(rawHTML, options)
        // .then(code => {
        //     const result = runCode(code, options.data);
        //     resolve(result);
        // }).catch(err => {
        //     reject(err);
        // });
    });
}

/* Compile and Generate new HTML based on parsedHTMLwithFunctions */
function generateHTML(code, vars) {
    const params = [];
    /*const parvalues = [];
    if(vars) {
        for(var k in vars) {
            if(!vars.hasOwnProperty(k)) continue;
            parvalues.push(vars[k]);
            params.push(k);
        }
    }*/
    const context = vm.createContext(vars);
    const parsedHTML = vm.compileFunction(code, params, {
        //filename: p
        parsingContext: context
    });

    return parsedHTML.call(context);
}

module.exports = ssiDirectiveHandler;