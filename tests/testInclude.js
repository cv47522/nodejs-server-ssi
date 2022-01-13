const path = require('path');
const ssiServer = require('../index.js');

const staticRoot = path.join(__dirname, 'public');
const homepage = path.join(staticRoot, 'index.shtml');

ssiServer();
// or use specific homepage
// ssiServer(staticRoot, homepage);
// or use specific port
// ssiServer(staticRoot, homepage, 5000);