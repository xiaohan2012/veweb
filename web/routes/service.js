module.exports = {
    'pw_simscore': function(req, res){
	res.render('pw-simscore');
    },
    'batch_query': function(req, res){
	res.render('batch-query');
    },
    'others': function (req, res) {
	var url = req.originalUrl.replace ('/service', '');
	console.log ('redirecting to', url);
	res.redirect (url);
    }
};

