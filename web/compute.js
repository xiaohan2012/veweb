var exec = require('child_process').exec,
util = require ('util'),
async = require ('async'),
path = require ('path');

function getPdbPath (id){
    return util.format ('%s/pdbs/%s.pdb', __dirname, id);
}

function getUploadPath (rel_path){
    return path.normalize(util.format ('%s/%s', __dirname, rel_path));
}

exports.getPdbPath = getPdbPath;
exports.getUploadPath = getUploadPath;

exports.simscore = function (query_path, query_epitope, against_path, against_epitope, callback){
    /*
      the full command is: 
      $ python ../simscore/get_sim_score.py --query-pdb pdbs/sample1.pdb  --query-epitope 211,213,214,224,225,226,227,228,229 --against-pdb pdbs/sample2.pdb --against-epitope 216,217,218,219,220,221
    */
    var cmd = util.format('python %s/../simscore/get_sim_score.py --query-pdb %s --against-pdb %s', __dirname, query_path, against_path);
    
    //options for epitope
    cmd += (query_epitope.length === 0 ? '' : ' --query-epitope ' + query_epitope.map (function (resnum){
	return resnum.toString();
    }).join (','));

    cmd += (against_epitope.length === 0 ? '' : ' --against-epitope ' + against_epitope.map (function (resnum){
	return resnum.toString();
    }).join (','));
    
    exec (cmd, function (error, stdout, stderr){
	console.log (error);
	console.log (stderr);
	callback (JSON.parse (stdout));
    });
};

/*
  pairwise_func can be any function that takes two path and one callback.
  This function is created to separate testing for the pw-score calculation testing with the matrix calculation.
*/

exports.makeMatrixCalculator = function (pairwise_func) {
    return function(query_paths, against_paths, against_ids, callback){
	var simmatrix = {};
	
	query_paths = query_paths.map (function (query){
	    return {
		name: query.name, 
		path: getUploadPath(query.path),  //translate the path to file system path 
		epitope: query.epitope
	    };
	});
	
	against_paths = against_paths.map (function (against){
	    return {
		name: against.name, 
		path: getUploadPath(against.path),  //translate the path to file system path 
		epitope: against.epitope
	    };
	})
	    .concat(against_ids.map (function (against){
		//convert the pdb ids to (path,name) objects
		var id = against.id;
		return {
		    name: id, 
		    path: getPdbPath (id),
		    epitope: against.epitope
		};
	    }));
	
	query_paths.forEach (function (query){
	    simmatrix[query.name] = {};
	});
	
	/*
	  for each query structure, 
	  for each against structure
	  calculate the sim score and store it in the matrix
	*/
	//equal to two for loops executed in serial
	async.series (query_paths.map (function(query){

	    return function (outerCallback){
		async.series (against_paths.map (function (against){
		    return function (innerCallback) {
			console.log (query.path, against.path);
			pairwise_func (query.path, query.epitope, against.path, against.epitope, function (simscore){
			    simmatrix[query.name][against.name] = simscore;
			    innerCallback ();
			});
		    };
		}), function (){
		    outerCallback ();
		});
	    }
	}), function (){
	    callback (simmatrix);
	});
    };
};

exports.simmatrix = exports.makeMatrixCalculator (exports.simscore)