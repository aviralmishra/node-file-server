var path = require('path');
var fs = require('fs');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');

var logger = require('morgan');
var router = express.Router();

var port = process.env.PORT || 4000;
var environment = process.env.NODE_ENV || 'dev';
var dir = path.join(__dirname);

var mimeTypes = {
  html: 'text/html',
  xml: 'text/xml',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

/* Setup middlewares. */
app.use(bodyParser.urlencoded({extended: true}));

app.use(compress());
app.use(logger('dev'));
app.use(cors());

app.use(function(err, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.status(err.status || 500).json({errorMessage: err.message});
});

app.get('/', function(req, res) {
  var routes = [];
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      routes.push(r.route.path);
    }
  })
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({status: 'Success', routes: routes});
});

app.get('*', function(req, res) {
  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  console.info(`Serving ${file}`);

  if (file.indexOf(dir + path.sep + 'documents' + path.sep) !== 0) {
    return res.status(403).end('Forbidden');
  }

  var type = mimeTypes[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function() {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function() {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});

/* Run server. */
console.log('**********************************************************');
console.log('Starting service...');
console.log(`PORT= ${port}`);
console.log(`NODE_ENV= ${environment}`);
console.log('**********************************************************');

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
