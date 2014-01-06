var exec = require('child_process').exec,
util = require ('util');

module.exports = {
    get_seq: function (path, callback) {
	var cmd = util.format('python %s/../simscore/get_seq.py %s', __dirname, path);
	
	exec (cmd, function (error, stdout, stderr){
	    console.log (stderr);
	    callback (JSON.parse (stdout));
	});

    }
};