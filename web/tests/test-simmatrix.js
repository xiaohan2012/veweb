var mocha = require ('mocha'), 
should = require ('should'),
simmatrix = require ('../compute').simmatrix;

var query_paths = [
    {
	name: 'sample1.pdb',
	path: '/upload/19560-139wer8.pdb',
	epitope: []
    },
    {
	name: 'sample2.pdb',
	path: '/upload/19560-1mf9xex.pdb',
	epitope: [216,217,218,219,220,221]
    }
], against_paths = [
    {
	name: 'sample1.pdb',
	path: '/upload/19560-139wer8.pdb',
	epitope: [211,213,214,224,225,226,227,228,229]
    },
    {
	name: 'sample2.pdb',
	path: '/upload/19560-1mf9xex.pdb',
	epitope: []
    }
];

var against_ids = [{id: 'sample1', epitope: []}, {id: 'sample2', epitope: [216,217,218,219,220,221] }];


describe ('similarity matrix calculation', function (done){
    this.timeout (1000000);//1000 sec
    it ('should give a matrix, given **only** against_paths' , function (done){
	simmatrix (query_paths, against_paths, [], function (matrix){
	    matrix['sample1.pdb']['sample1.pdb'].should.eql ({"status": 0, "score1": 60.486381870509589, "score2": 39.0, "score3": 9.0});
	    matrix['sample1.pdb']['sample2.pdb'].should.eql ({"status": 0, "score1": 118.00269647021571, "score2": -8.0, "score3": 20.0});
	    matrix['sample2.pdb']['sample1.pdb'].should.eql ({"status": 0, "score1": 34.70575420370386, "score2": 0.0, "score3": 6.0});
	    matrix['sample2.pdb']['sample2.pdb'].should.eql ({"status": 0, "score1": 35.714397053710343, "score2": 10.0, "score3": 6.0});
	    done ();
	});
    });

    it ('should give a matrix, given both against_paths and against_ids' , function (done){
	simmatrix (query_paths, against_paths, against_ids, function (matrix){
	    matrix['sample1.pdb']['sample1.pdb'].should.eql ({"status": 0, "score1": 60.486381870509589, "score2": 39.0, "score3": 9.0});
	    matrix['sample1.pdb']['sample2.pdb'].should.eql ({"status": 0, "score1": 118.00269647021571, "score2": -8.0, "score3": 20.0});
	    matrix['sample1.pdb']['sample1'].should.eql ({"status": 0, "score1": 260.0, "score2": 119.0, "score3": 26.0});
	    matrix['sample1.pdb']['sample2'].should.eql ({"status": 0, "score1": 29.406958748067918, "score2": -8.0, "score3": 6.0});

	    matrix['sample2.pdb']['sample1.pdb'].should.eql ({"status": 0, "score1": 34.70575420370386, "score2": 0.0, "score3": 6.0});
	    matrix['sample2.pdb']['sample2.pdb'].should.eql ({"status": 0, "score1": 35.714397053710343, "score2": 10.0, "score3": 6.0});
	    matrix['sample2.pdb']['sample1'].should.eql ({"status": 0, "score1": 29.406958748067918, "score2": -8.0, "score3": 6.0});
	    matrix['sample2.pdb']['sample2'].should.eql ({"status": 0, "score1": 60.0, "score2": 34.0, "score3": 6.0});

	    done ();
	});
    });
});