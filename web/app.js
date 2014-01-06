
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('./routes'),
api = require('./routes/api'),
service = require('./routes/service'),
fileReceiver = require ('./routes/file-receiver');

var app = express();

// all environments

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/upload' }));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jmol', express.static(path.join(__dirname, 'jmol')));
app.use('/j2s', express.static(path.join(__dirname, 'jmol/jsmol/j2s')));
app.use('/pdbs', express.static(path.join(__dirname, 'pdbs')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get ('/service/batch-query', service.batch_query);
app.get ('/service/*', service.others);//to cope with jmol's relative path issue
//app.get('/js-script/insert-jmol-applet.js', js_script.insert_jmol_applet);

app.get('/api/simmatrix', api.simmat);
app.get('/api/aa-sequence', api.aa_sequence);

app.post('/upload', fileReceiver.receive);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
}).on('connection', function(socket) {
    socket.setTimeout(10 * 1000);     // 10 secs timeout. as the computation might take a long time!
});
