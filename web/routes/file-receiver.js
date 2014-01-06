var path = require ('path');

module.exports = {
    receive: function (req, res){
	var file =  req.files.attachment,
	upload_path = path.join('/upload', path.basename(file.path));
	
	res.json ({path: upload_path});
    }
};