/*
  the Uploader class
*/
function Uploader (selector, callback){
    var self = this;
    
    /*
      jQuery ajax file upload referred from [here](https://github.com/Abban/jQueryFileUpload)
    */
    
    /*
      when the file input is changed, record all the files
    */
    $ (selector + ' input[type=file]').on('change', function (event){
	self.files = event.target.files;
	console.log (self.files);
    });
    
    $ (selector + ' form#pdb-upload-form').on ('submit', function (event){
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening

	var data = new FormData();
	data.append ('attachment', self.files[0]);
	
	$.ajax({
	    url: '/upload',
	    type: 'POST',
	    data: data,
	    cache: false,
	    dataType: 'json',
	    processData: false, // Don't process the files
	    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
	    success: function(data, textStatus, jqXHR){
		console.log('data: ', data);
		self.path = data.path;

		//pass the path to callback
		if (typeof callback === 'function' ){
		    callback (self.path, self.files);
		}

	    },
	    error: function(jqXHR, textStatus, errorThrown)
	    {
		console.log('ERRORS: ', textStatus);
	    }
	});
    })
}

function renderTable(selector, column_headers, row_headers, data){
    //render it in html
    var html = '<tr><th></th>' + 
	column_headers.map (function (h){
	    return '<th>' + h + '</th>';
	}).join ('') + 
	'</tr>';
    
    var topn = parseInt($ ('input[name=topn').val ());
    
    for (var i = 0; i < row_headers.length; i++){
	var row = '<tr>' + 
	    '<th>' + row_headers[i] + '</th>' +
	    data[i].map (function (score){
		return '<td>' + score.toString () + '</td>';
	    }).join ('') +
	    '</tr>';
	html += row;
    }
    $ (selector).html (html);
}

/*
  amino acid sequence displayer
*/
function SequenceDisplay(selector, title, path_or_id, success_cb, fail_cb){
    /*
      retreive the seq data and display it
      callback: after the ajax call is made
    */
    var self = this;
    
    self.id = path_or_id.pdb_path || path_or_id.pdb_id;
    
    self.reslist = [];
    self.allres = null;

    self.html = null;
    
    self.labelOn = false;
    self.selectedColor = 'yellow';
    self.unselectedColor = 'gray';

    self.load3D = function () {
	console.log ('loading 3D structure');
	
	//render the 3D structure
	var cmd = null;
	if (path_or_id.pdb_id) {
	    cmd = 'load /pdbs/' + path_or_id.pdb_id + '.pdb; ';
	}
	else{
	    cmd = 'load ' + path_or_id.pdb_path + '; ';
	}
	//cmd += '; label %n: %r;';
	cmd += 'color background black; ';

	jmolScript (cmd);
	
	emphasize (self.reslist);

	if (self.labelOn){//label the unselected if necessary
	    jmolScript(getSelectionString (_.difference(self.allres, self.reslist), '.ca') + getlabelcmd (self.unselectedColor));
	}
    };

    function getSelectionString (resnums, suffix) {
	if (!suffix) {
	    suffix = '';
	}
	return 'select ' + resnums.map (function (resnum){
	    return resnum.toString () + suffix;
	}).join (',') + '; ';
    }
    
    function getlabelcmd(color){
	return 'label %r: %n; color label ' + color  + '; ';
    }

    self.label = function(){
	/*
	  label the selected residues
	  associated with the label-on/off checkbox, so make it accissible to the outside
	*/

	//show the label of unselected residues
	var select_string = getSelectionString(_.difference(self.allres, self.reslist), ' .ca'),
	cmd = select_string + getlabelcmd (self.unselectedColor);
	
	if (self.reslist.length > 0) {
	    //show label of the selected residues if something are selected
	    var select_string = getSelectionString(self.reslist, ' .ca');
	    cmd += (select_string + getlabelcmd (self.selectedColor));
	}

	jmolScript (cmd);
	
	self.labelOn = true;
    };

    self.unlabel = function (){
	/*
	  hide the label
	*/
	jmolScript ('label off; ');
	self.labelOn = false;
    };

    function emphasize (resnums) {
	//emphasize the residues specified by resnums
	//enlarge the atoms and change the residue label
	if (resnums.length > 0) {
	    var cmd = getSelectionString(resnums) + 'spacefill 50%; ';
	    
	    if (self.labelOn) { //if labeling is on, then emphasize the label color as well
		cmd += getSelectionString (resnums, '.ca') + getlabelcmd (self.selectedColor);
	    }
	    jmolScript (cmd);
	}
    }

    function deemphasize(resnums) {
	if (resnums.length > 0) {
	    var cmd = getSelectionString(resnums) + 'spacefill 10%; ';

	    if (self.labelOn) {
		cmd += (getSelectionString (resnums, '.ca') + getlabelcmd (self.unselectedColor));
	    }
	    jmolScript (cmd);
	}
    }
    
    function updateCurrentSequence() {
	if (currentSequence !== self){//if the current sequence is not self, then reload the 3D and set current sequence to self 
	    currentSequence = self;
	    self.labelOn = showLabelCheckbox.is (':checked');
	    console.log (self.labelOn);
	    self.load3D ();
	}
    }

    var jqxhr = $.getJSON ('/api/aa-sequence', $.param(path_or_id), function (data){
	//prepare the aa sequence html
	var html =  '<div class="aa-sequence">' + 
	    '<h3>' + title+ '</h3>' + 
	    data.map (function (res){
		return '<span class="res" title="' + res.pdbres + ', resnum:' + res.resnum.toString () + '" resnum="' + res.resnum.toString () +'">' + res.resnum.toString () + ': ' + res.code + '</span>';
	    }).join ('') + 
	    //insert the applet right after the sequence
	    '</div>';
	
	//get resnums of all residue
	self.allres = data.map (function (res){
	    return res.resnum;
	});
	
	//the epitope selection part
	$ (selector).append (html).find ('.aa-sequence:last').children('span.res').click (function (){
	    //set the globa variable, currentSequence to this sequenceDisplayer
	    updateCurrentSequence ();

	    var $this = $ (this);
	    if (!$this.hasClass ('res-active')) { //not activated yet
		$this.addClass ('res-active'); //then activate
		
		var resnum = parseInt($this.attr ('resnum'));
		
		if (self.reslist.indexOf (resnum) === -1) {//and add to epitope if necessary
		    self.reslist.push (resnum);
		}

		//reflect the change to 3D display
		emphasize([resnum]);
	    }
	    else {
		//remove from epitope
		$this.removeClass ('res-active');
		var resnum = parseInt($this.attr ('resnum')),
		idx = self.reslist.indexOf (resnum);
		
		if ( idx >= 0) {
		    self.reslist.splice (idx, 1);
		}
		//reflect the change to 3D display
		deemphasize([resnum]);
	    }
	});
	
	self.html = $ (selector).find ('.aa-sequence:last');
	self.success = true;
	
	self.hide = function (){
	    self.html.hide ();
	}

	self.show = function (){
	    self.html.show ();
	}
	
	self.load3D ();
    });

    if (typeof success_cb === 'function'){ //if success callback is passed in
	jqxhr.done (success_cb);
    }

    if (typeof fail_cb === 'function'){ //if fail callback is passed in
	jqxhr.fail (fail_cb);
    }


};

/*
the textarea in which users can type pdb ids
*/
function PdbIdTextArea (selector) {
    var self = this;
    self.fetched_ids = [];
    self.sequenceTable = {};
    self.lock = false;
    self.ids = null;
    
    $ (selector).bind ('input propertychange', function (){
	if (self.lock) {
	    //ajax requests not completed
	    console.log ('locked');
	    return;
	}

	self.lock = true;//lock it temporarily
	
 	var ids = $ (this).val ().split (' ').map (function (id){
	    return id.trim ();
	}).filter (function (id){
	    return id.length > 0;
	});
	
	if (ids.length === 0) {
	    self.lock=false;//when no ids are presented, then unlock
	}
	
	var counter = 0;
	
	self.ids = ids;

	ids.forEach (function (id){
	    if (self.fetched_ids.indexOf (id) >= 0){
		//fetched
		counter += 1;
		if (counter === ids.length) {
		    self.lock = false;
		    self.hide ();
		}
		self.sequenceTable[id].seq.show (); 
		self.sequenceTable[id].use = true; //will use this pdb
	    }
	    else {
		//fetch and display 
		var seqdisp = new SequenceDisplay ('#against-epitope-selection', id, {pdb_id: id}, function (){
		    self.sequenceTable[id] = {
			use: true,
			seq: seqdisp
		    };

		    //expand the fetched list
		    self.fetched_ids = _.union(self.fetched_ids, [id]);
		    counter += 1;
		    
		    if (counter === ids.length) {
			//all ajax requests completed
			self.lock = false;
			self.hide ();
		    }
		}, function (){
		    console.log ('invalid pdb id', id);
		    counter += 1;
		    if (counter === ids.length) {
			//all ajax requests completed
			self.lock = false;
			self.hide ();
		    }		 
		});
	    }
	});
    });

    self.hide = function () {
	//hide those not in the textarea
	_.difference(self.fetched_ids, self.ids).forEach (function (id){
	    self.sequenceTable[id].use = false;//will not use this pdb
	    self.sequenceTable[id].seq.hide ();//and hide it
	});
    };

    self.prepareForm = function () {
	console.log ('sequenceTable', self.sequenceTable);
	return Object.keys(self.sequenceTable).filter (function (id){
	    return self.sequenceTable[id].use;
	}).map (function (id){
	    return {
		id: id, 
		epitope: self.sequenceTable[id].seq.reslist
	    };
	});
    };
    
};