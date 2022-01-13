const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const path = require('path');
const fs = require('fs');
const ssi = require('./lib/ssi');

const PORT = 3000;
const root = path.join(__dirname, 'public')
const file = path.join(root, 'index.shtml');

const ssiServer = (staticRoot = root, homepage = file, port = PORT) => {
    let parsedHtml;

    const getParsedHtml = async (file) => {
        const result = await ssi.parse(file);
        // console.log(result);
        parsedHtml =  result;
    };

    // convert homepage with ssi directives into complete Html
    getParsedHtml(homepage);

    // set a folder serving static files
    app.use(express.static(staticRoot));
    // set favicon
    app.use(favicon(path.join(staticRoot, 'images', 'favicon.png')));
    // set homepage
    app.get('/', (req, res) => {
        // res.sendFile(path.join(staticRoot, 'index.shtml'));
        res.write(parsedHtml);
    });
    // start a http server
    app.listen(port, () =>
        console.log(`Server started at http://localhost:${port}`)
    );
};

module.exports = ssiServer;
