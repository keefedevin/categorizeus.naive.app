class UI{
  constructor(templateSources){
    this.templateSources = templateSources;
    this.templates = {};
    this.api = new CategorizeUs();
    this.settings = {
      liveUpdates : false,
    	pollRate : 3000,
    	updateBatchSize : 1,
    	uiUpdateRate : 1500
    };
    this.query = {
    	tags : [],
    	loadMetadata : true,
    	after : null,
    	before : null,
    	count : 20,
    	sortBy : "desc"
    };
    this.user = null;
    this.previousBounds = [];
    this.id2Messages = {};
  }

  initialize(cb){
      this.loadTemplates(err =>{
        if(err){
            console.log(err);
            return cb(err);
        }
        this.api.fetchCurrentUser((err, user) =>{
          if(err) console.log(err);
          this.user = user;
          cb(err, user);//going to load some other stuff here
        });
      })
  }

  loadTemplates(cb){
    async.each(this.templateSources, (tmpl, cb)=> {
      $.get(tmpl.url, data => {
        this.templates[tmpl.name] = Handlebars.compile(data);
        cb();
      });
    }, err => {
      if(err) console.log(err);
      cb(err);
    });
  }
  tmpl(name, data){
    return this.templates[name](data);
  }
  search(tags, cb){
    this.query.tags = tags;
    this.query.before = null;
    this.query.after = null;
    this.previousBounds = [];
    this.id2messages = {};
    this.totalMessages = 0;
    this.searchByQuery(this.query, cb);
  }
  nextPage(cb){
    if(this.query.sortBy=="asc"){
      this.query.after = null;
      if(this.this.currentMessages.length>0){
        this.query.after = this.this.currentMessages[this.this.currentMessages.length-1].message.id;
      }
      this.query.before = null;
    }else if(this.query.sortBy=="desc"){
      this.query.after = null;
      this.query.before = null;
      if(this.this.currentMessages.length>0){
        this.query.before = this.this.currentMessages[this.this.currentMessages.length-1].message.id;
      }
    }
    this.searchByQuery(this.query, cb);
  }

    previousPage(cb){
    	if(this.previousBounds.length>1){
    		this.previousBounds.pop();
    		console.log(JSON.stringify(this.previousBounds));
    		var goalBounds = this.previousBounds.pop();//this is what the next one SHOULD be
    		this.query.after = null;
    		this.query.before = null;
    		if(this.previousBounds.length>0 && this.query.sortBy == "asc"){
    			this.query.after = this.previousBounds[this.previousBounds.length-1].to;
    		}
    		else if(this.previousBounds.length>0 && this.query.sortBy == "desc"){
    			this.query.before = this.previousBounds[this.previousBounds.length-1].to;
    		}
        this.searchByQuery(this.query, cb);
    	}
  }

  searchByQuery(q, cb){//raw function no book keeping
    this.api.tagSearchThread(q, (err, messages) => {
        this.currentMessages = messages;//TODO handling updates
        this.totalMessages = messages.length;
        if(messages.length!=0){
          this.previousBounds.push(
      		{
      			from:messages[0].message.id,
      			to:messages[messages.length-1].message.id
      		});
        }
        for(let message of messages){
          this.id2messages[message.message.id] = message;
        }
        cb(err, messages);
    });
  }

  checkForUpdates(cb){
    var updateQuery = {
  		tags : this.query.tags,
  		loadMetadata : true,
  		after : null,
  		before : null,
  		count : this.query.count,
  		sortBy : this.query.sortBy
  	};

  	if(this.query.sortBy=="desc" && this.currentMessages.length>0){
  		//this becomes complicated due to loading many pages server side before querying the next one
  		updateQuery.sortBy = "asc";
  		updateQuery.after = this.currentMessages[0].message.id;
  		if(pendingUpdates.length>0){
  			updateQuery.after = pendingUpdates[pendingUpdates.length-1].message.id;
  		}
  	}else if(this.query.sortBy=="asc" && this.currentMessages.length>0){//totally untested block!
  		this.query.after = this.currentMessages[this.currentMessages.length-1].message.id;//what does this block mean?
  		if(pendingUpdates.length>0){
  			updateQuery.after = pendingUpdates[pendingUpdates.length-1].message.id;
  		}
  	}
    this.api.tagSearchThread(updateQuery, (err, messages) => {
        /*for(let message of messages){
        this structure is being used as a proxy for an "is in view" check
          this.id2messages[message.message.id] = message;
        }*/
        cb(err, messages);
    });
  }

}
