var mocha = require ('mocha'), 
should = require ('should'),
fs = require ('fs'),
request = require ('request'),
async = require ('async'),
uploader = require('file-uploader'),
querystring = require ('querystring');

var options = {
    host : 'localhost',
    port : 3000,
    path : '/upload',
    method : 'POST',
    enctype: "multipart/form-data",
    encoding : 'utf8'
};


describe ('/api/simmat', function (){
    describe ('input 1 query structure and 2 against ids ', function (){
	
	it ('should output three scores with the status code', function (done){
	    var sample_path = __dirname + '/data/sample1.pdb',
	    query_path = null,
	    query_name = 'sample1';

	    this.timeout (600000); //10 mins
	    /*
	      first upload the pdb file and get the file id
	    */
	    async.series ([
		/*upload sample1.pdb*/
		function (cb){
		    uploader.postFile(options, sample_path, {}, function(err, res) {
			var obj = JSON.parse(res.body);
			res.statusCode.should.equal (200);
			query_path = obj.path;
			cb ();
		    });
		},
		/*request for batch query*/
		function (cb){
		    var against_ids = ['sample1', 'sample2'].map (function (e){
			return {id: e, epitope: []};
		    });

		    request ('http://localhost:3000/api/simmatrix?' + 
			     querystring.stringify ({
				 query_paths: JSON.stringify([{name: query_name, path: query_path, epitope: []}]),
				 against_ids: JSON.stringify (against_ids)
			     }),
			     function (error, response, body){
				 response.statusCode.should.equal (200);
				 body = JSON.parse(body);

				 body.should.have.property (query_name);
				 against_ids.forEach(function (against){
				     body[query_name].should.have.property (against.id);
				     body[query_name][against.id].should.have.properties ('score1', 'score2', 'score3');
				 });
				 
				 cb ();
			     }
			    );
		}
	    ], function (){
		done ();
	    });
	});
    });
});

