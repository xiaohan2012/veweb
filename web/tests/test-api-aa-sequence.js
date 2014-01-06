var mocha = require ('mocha'), 
should = require ('should'),
request = require ('request'),
querystring = require ('querystring');

describe ('/api/aa-sequence', function (){
    var url = 'http://localhost:3000/api/aa-sequence',
    path = '/upload/11506-1q81xqm.pdb',
    id = 'sample1';
    
    it ('should give the residue sequence given only the pdb_path', function (done){

	request (url + '?' + querystring.stringify ({pdb_path: path}), function (error, response, body){
	    response.statusCode.should.equal (200);
	    body = JSON.parse(body);
	    body.should.be.instanceof (Array);
	    body[0].should.have.properties ('resnum', 'code', 'pdbres');
	    done ();
	});
    });

    it ('should give the residue sequence given only the pdb_id', function (done){
	request (url + '?' + querystring.stringify ({pdb_id: 'sample1'}), function (error, response, body){
	    response.statusCode.should.equal (200);
	    body = JSON.parse(body);
	    body.should.be.instanceof (Array);
	    body[0].should.have.properties ('resnum', 'code', 'pdbres');
	    done ();
	});
    });

    it ('should give the residue sequence given both query params', function (done){
	request (url + '?' + querystring.stringify ({pdb_id: id, pdb_path: path}), function (error, response, body){
	    response.statusCode.should.equal (200);
	    body = JSON.parse(body);
	    body.should.be.instanceof (Array);
	    body[0].should.have.properties ('resnum', 'code', 'pdbres');
	    done ();
	});
    });

    it ('should receive 404 if non params are provided', function (done){
	request (url, function (error, response, body){
	    response.statusCode.should.equal (404);
	    done ();
	});
    });

    it ('should receive 404 if invalid id is provided', function (done){
	request (url + '?' + querystring.stringify ({pdb_id: 'asdf'}), function (error, response, body){
	    response.statusCode.should.equal (404);
	    done ();
	});
    });

    it ('should receive 404 if invalid path is provided', function (done){
	request (url + '?' + querystring.stringify ({pdb_path: '/feng/sb.txt'}), function (error, response, body){
	    response.statusCode.should.equal (404);
	    done ();
	});
    });

});

