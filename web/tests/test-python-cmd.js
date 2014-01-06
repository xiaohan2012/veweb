var mocha = require ('mocha'), 
should = require ('should'),
cmd = require ('../python-cmd.js');

describe ('get_seq', function (){
    it ('should output json data of the residues, given pdbs/sample1.pdb', function (done){
	cmd.get_seq (__dirname + '/../pdbs/sample1.pdb', function (data){
	    data.should.be.instanceof (Array);
	    data[0].should.have.properties ('resnum', 'code', 'pdbres');
	    done ();
	})
    });
});
