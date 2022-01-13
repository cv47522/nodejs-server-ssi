const path = require('path');
const fs = require('fs').promises; // for using async / await
// const fs = require('fs');

const ssiContentGenerator = require('./ssiContentGenerator');

/**
 * Resolve .shtml files:
 * file {string} - homepage (e.g., index.shtml)
 * options {object} - optional parameters
 *      data - other input variables for directives other than #include
 *      root - the root path of the file
 */
async function parse(file, options) {
    // clone options to optionsDict
    let optionsDict = options || {};
    return new Promise(async (resolve, reject) => {
        // resolve the file to an absolute file path, if root is null, create an empty string
        if(optionsDict.root) file = path.resolve(optionsDict.root || '', file);
        optionsDict.file = file;

        try {
            const data = await fs.readFile(file, 'utf8');
            let result = await ssiContentGenerator(data, optionsDict);
            resolve(result);
        } catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    parse
};