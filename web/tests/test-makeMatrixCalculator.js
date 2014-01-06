var mocha = require ('mocha'), 
should = require ('should'),
fs = require ('fs'),
makeMatrixCalculator = require ('../compute').makeMatrixCalculator;

var query_paths = [
    {
	name: 'sample1.pdb',
	path: '/upload/19560-139wer8.pdb',
	epitope: []
    },
    {
	name: 'sample2.pdb',
	path: '/upload/19560-1mf9xex.pdb',
	epitope: []
    }
], against_paths = [
    {
	name: 'sample1.pdb',
	path: '/upload/19560-139wer8.pdb',
	epitope: []
    },
    {
	name: 'sample2.pdb',
	path: '/upload/19560-1mf9xex.pdb',
	epitope: []
    }
];


var against_ids = [{id: '3J4U', epitope: []},
		   {id: '4MTP', epitope: []}, 
		   {id: '2M8P', epitope: []}, 
		   {id: '3W0W', epitope: []}, 
		   {id: '4KOL', epitope: []}];

var pw_func_stub = function (path1, dummy1, path2, dummy2, callback){
    //check if the paths exist
    fs.existsSync (path1).should.be.true;
    fs.existsSync (path2).should.be.true;

    //pass the fake result to callback
    callback ({status: 0, score1: 1, score2: 1, score3: 1});
};

var matrixCalculator = makeMatrixCalculator (pw_func_stub);

describe ('matrix calculation with stub', function (done){
    
    it ('should give a matrix with the appropriate the fileds', function (done){
	
	matrixCalculator (query_paths, against_paths, against_ids, function (matrix){
	    query_paths.forEach (function (query){
		matrix.should.have.property (query.name);

		against_paths.forEach (function (against){
		    matrix[query.name].should.have.property (against.name);
		    matrix[query.name][against.name].should.have.properties ('score1', 'score2', 'score3');
		});

		against_ids.forEach (function (against){
		    matrix[query.name].should.have.property (against.id);
		    matrix[query.name][against.id].should.have.properties ('score1', 'score2', 'score3');
		});

	    });
	    done ();
	});
    });
});


