const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const path = require('path');
const fs = require('fs');
// const ssi = require('ssi');
const ssi = require('./lib/ssi');
// const ssi = require('jm-ssi');

const inputDir = path.join(__dirname, 'public');
const outputDir = path.join(__dirname, 'public', 'out');

const PORT = 8080;
/* ssi */
// const ssiParser = new ssi(inputDir, outputDir, "");
// const filename = path.join(inputDir, 'index.shtml')
// const contents = fs.readFileSync(filename, {encoding: "utf8"});
// const results = ssiParser.parse(filename, contents);
// const parsedHTML = results.contents;

/* jm-ssi */
const root = path.join(__dirname, 'public');
// const homepage = 'index.shtml';
const homepage = path.join(root, 'index.shtml');

// const getParsedHTML = async (file, root) => {
//     try {
//         const result = await ssi.parse(file, { root });
//         console.log(result);
//         return result;
//     } catch(err) {
//         console.log(err);
//     }
// };

// const parsedHTML = getParsedHTML(homepage, root);

// ssi.parse(homepage, { root })
ssi.parse(homepage)
.then(result => {
    console.log(result);
    parsedHTML = result;
});

// set a folder serving static files
app.use(express.static(path.join(__dirname, 'public')));
// set favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
// set home page
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.shtml'));
    res.write(parsedHTML);
});

app.listen(PORT, () =>
    console.log(`Server started at http://localhost:${PORT}`)
);