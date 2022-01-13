const vm = require("vm");
const ssiDecoder = require('./ssiDecoder');

/**
 * rawHtml {string} - homepage (e.g., index.shtml)
 * options {object} - optional parameters
 *      data - other input variables for directives other than #include
 *      root - the root path of the file
 */
const ssiContentGenerator = (rawHtml, options) => {
    options = options || {};
    options.data = options.data || {};
    options.root = options.root || '';

    return new Promise(async (resolve, reject) => {
        try {
            const htmlToJs = await ssiDecoder.decode(rawHtml, options);
            const result = generateHtml(htmlToJs, options.data);
            resolve(result);
        } catch(err) {
            reject(err);
        }
    });
}

/* Compile and Generate new Html based on htmlToJs */
function generateHtml(code, vars) {
    const params = [];

    const context = vm.createContext(vars);
    const parsedHtml = vm.compileFunction(code, params, {
        parsingContext: context
    });

    return parsedHtml.call(context);
}

module.exports = ssiContentGenerator;