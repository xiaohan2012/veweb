var compute = require ('../compute.js'),
cmd = require ('../python-cmd.js'),
fs = require ('fs');

module.exports = {
    simmat: function (req, res){
	/*
	  get the parameters
	*/
	console.log (req.query.against_ids);
	
	var query_paths = JSON.parse(req.query.query_paths),
	against_paths = req.query.against_paths ? JSON.parse (req.query.against_paths) : [],
	against_ids = (req.query.against_ids ? JSON.parse (req.query.against_ids) : []);
	
	console.log (query_paths, against_paths, against_ids);
	
	compute.simmatrix (query_paths, against_paths, against_ids, function (simmatrix){
	    console.log ('simmatrix', simmatrix);
	    res.json (simmatrix);
	});
    },
    aa_sequence: function (req, res){
	var path = req.query.pdb_id ? compute.getPdbPath (req.query.pdb_id) : compute.getUploadPath(req.query.pdb_path);
	console.log ('path', path);
	
	if (!path || ! fs.existsSync (path)) {//invalid path
	    res.status (404);
	    res.json ({'msg': 'pdb not found'});
	    return;
	}
	
	cmd.get_seq (path, function (data){
	    res.json (data);
	})
    }
}
