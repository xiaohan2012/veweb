var mocha = require ('mocha'), 
should = require ('should'),
simscore = require ('../compute').simscore;

describe ('simscore calculator', function (done){
    var query_path = __dirname + '/data/sample1.pdb', 
    against_path = __dirname + '/data/sample2.pdb',
    query_epitope = [211,213,214,224,225,226,227,228,229],
    against_epitope = [216,217,218,219,220,221];
    
    this.timeout (10000);
    
    it ('should give the score, given only query-path and against-path', function (done){
	simscore (query_path, [], against_path, [], function (score){
	    score.should.have.properties ('score1', 'score2', 'score3');
	    score.should.eql ({"status": 0, "score1": 118.00269647021571, "score2": -8.0, "score3": 20.0});
	    done ();
	})
    });

    it ('should give the score, given paths and epitopes', function (done){
	simscore (query_path, query_epitope, against_path, against_epitope, function (score){
	    score.should.have.properties ('score1', 'score2', 'score3');
	    score.should.eql ({"status": 0, "score1": 34.705754203703869, "score2": 0.0, "score3": 6.0});
	    done ();
	})
    });

});
