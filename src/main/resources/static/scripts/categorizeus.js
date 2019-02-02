/**
This is the javascript http api for a categorize.us server, using jquery.
There should be no UI specific code in this file, it should all be in callbacks.
**/
//var deployPrefix = "https://ectiaevu68.execute-api.us-west-2.amazonaws.com/testing";


class CategorizeUs{
	constructor(){
		this.deployPrefix = "/v1";
		this.lastQuery = null;//TODO this clearly does not belong here
	}

	untagMessage(messageId, tag, cb){
		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:this.deployPrefix+'/messages/'+messageId+"/tags/"+tag,
			accepts:'application/json',
			method:'DELETE',
			contentType:"application/json"
		}).done(function(message, statusCode){
			if(cb){//TODO check for status code here?
				cb(null, message);
			}
		}).fail(function(){
			if(cb){
				cb("Can't tag messages for some reason");
			}
		});
	}

	tagMessage(messageId, tag, cb){
		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:this.deployPrefix+'/messages/'+messageId+"/tags/"+tag,
			accepts:'application/json',
			method:'PUT',
			contentType:"application/json"
		}).done(function(message, statusCode){
			if(cb){//TODO check for status code here?
				cb(null, message);
			}
		}).fail(function(){
			if(cb){
				cb("Can't tag messages for some reason");
			}
		});
	}
	tagMessages(tagArray, messageIdArray, cb){
		var expectedCount = tagArray.length * messageIdArray.length;
		var totalCount = 0;

		for(var messageId of messageIdArray){
			for(var tag of tagArray){
				this.tagMessage(messageId, tag, function(err, data){
					totalCount++;
					if(err) cb(err);
					if(totalCount==expectedCount){
						cb(null, data);//unclear what data to send
					}
				});//callback hell, need to rewrite this to tag one, do next etc some async thing
			}
		}
	};

	tagSearchThread(tagQuery, cb){
		var queryURI = this.deployPrefix+'/messages?';
		//loadMetadata=true&tags='+tagArray.join()+'&pageOn='+pageOn+'&pageSize='+pageSize;
		this.lastQuery = tagQuery;
		if(tagQuery.loadMetadata){
			queryURI = queryURI+'loadMetadata=true';
		}
		if(tagQuery.tags!=null && tagQuery.tags.length>0){
			queryURI = queryURI+'&tags='+tagQuery.tags.join();
		}
		if(tagQuery.before!=null){
			queryURI = queryURI+'&before='+tagQuery.before;
		}
		if(tagQuery.after!=null){
			queryURI = queryURI+'&after='+tagQuery.after;
		}
		if(tagQuery.count!=null){
			queryURI = queryURI+'&count='+tagQuery.count;
		}
		if(tagQuery.sortBy!=null){
			queryURI = queryURI+'&sort='+tagQuery.sortBy;
		}

		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:queryURI,
			method:'GET'
		}).done((messages, statusCode) => {//TODO fail handler
			if(statusCode!='success'){
				if(cb){
					cb("Error doing tag search!");
				}
			}else if(cb){
				var s = "";
				for(var i=0; i<messages.length;i++){
					s = s + messages[i].message.id+",";
					this.updateAttachmentLinks(messages[i]);
				}
				console.log(s);
				cb(null, messages);
			}
		});
	};
	/*
	TODO this needs to be thought through!
	*/
	updateAttachmentLinks(message){
		if(message.attachments){
			for(var i=0; i<message.attachments.length;i++){
				var attachment = message.attachments[i];
				var attachmentLink = "/files/" + attachment.id + attachment.extension;
				//TODO ugh
				if(attachment.filename.includes("small")){
					message.thumbnailLink = attachmentLink;
				}else{
					message.attachmentLink = attachmentLink;
				}
			}
			if(message.attachmentLink && !message.thumbnailLink){
				message.thumbnailLink = message.attachmentLink;
			}
		}
		//console.log(message);
	};

	loadMessage(id, cb){
		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:this.deployPrefix+'/messages/'+id+'/thread'
		}).done(function(messageThread, statusCode){
			console.log("In Response " + statusCode);
			if(statusCode!='success'){
				if(cb){
					cb("Error doing doc load!", response);
				}
			}else if(cb){
				cb(null, messageThread);
			}
		});

	};

	createMessage(message, cb){
		//adapting message to new format, hackish
		var tags = message.tags;
		delete message.tags;
		$.ajax({
			url:this.deployPrefix+'/messages/',
			method:'POST',
			contentType:"application/json",
			data:JSON.stringify(message)
		}).done((response, statusCode) => {
			console.log("In Response " + statusCode);
			console.log(response);
			if(tags && tags.length>0){
				var tagArray = tags.split(",");
				for(var t of tagArray){
					this.tagMessage(response.id, t);
				}
			}
			if(statusCode!='success'){
				if(cb){
					cb("Please Login to Post", response);
				}
			}else if(cb){
				cb(null, response);
			}
		}).fail(() => {
			cb("Please Login to Post");
		});
	};

	createMessageWithAttachment(message, files, cb){
	  /*var reader = new FileReader();
	  reader.addEventListener("load", function(){
			message.attachment = {
	      name:files[0].name,
	      type:files[0].type,
	      dataURL:reader.result,
	      size:files[0].size
	    }
			reader.readAsArrayBuffer(files[0]);

			var fd = new FormData();
			fd.append("file", reader.result);
	  });*/
	  if(files[0]!=null){
	    console.log(files[0]);
	    if(files[0].type.startsWith("image")){
				this.createMessage(message, (error, uploadedMessage) => {
					if(error){
						if(cb){
							cb(error);
						}
						return;
					}
					var fd = new FormData();
					fd.append("file", files[0]);
					$.ajax({
						headers: {
							Accept: "application/json; charset=utf-8"
						},
						url:this.deployPrefix+'/messages/'+uploadedMessage.id+"/attachments",
						method:'POST',
						contentType: false,
						mimeType: 'multipart/form-data',
						processData:false,
						data:fd
					}).done((response, statusCode)=>{
						console.log("In Response " + statusCode);
						console.log(response);
						if(statusCode!='success'){
							if(cb){
								cb("Please Login to Post", response);
							}
						}else if(cb){
							cb(null, response);
						}
					}).fail(()=>{
						cb("Please Login to Post");
					});
				});
	    }else{
	      alert("Invalid Attachment detected, please try again!");
	    }
	  }
	}

	loginUser(username, password, cb){
		var buffer = new TextEncoder("utf-8").encode(password);
			crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
			var user = {
				username:username,
				passhash:hex(hash)
			};
			$.ajax({
				url:this.deployPrefix+'/auth/login',
				method:'POST',
				contentType:"application/json",
				data:JSON.stringify(user)
			}).done(function(response, statusCode){
				console.log("In Response " + statusCode);
				if(statusCode!="success"){
					if(cb){
						cb("Error logging in! Please try again");
					}
				}else{
					if(cb){
						cb(null, response);//TODO what should this response be?
					}
				}

			});
		});
	};
	hex(buffer) {
	  var hexCodes = [];
	  var view = new DataView(buffer);
	  for (var i = 0; i < view.byteLength; i += 4) {
	    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
	    var value = view.getUint32(i)
	    // toString(16) will give the hex representation of the number without padding
	    var stringValue = value.toString(16)
	    // We use concatenation and slice for padding
	    var padding = '00000000'
	    var paddedValue = (padding + stringValue).slice(-padding.length)
	    hexCodes.push(paddedValue);
	  }

	  // Join all the hex strings into one
	  return hexCodes.join("");
	}
	fetchCurrentUser(cb){
		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:this.deployPrefix+'/users/principal',
			accepts:'application/json'
		}).done(function(currentUser, statusCode){
			console.log("In Response " + statusCode);
			if(statusCode!='success'){
				if(cb){
					cb("User is not Logged In", response);
				}
			}else if(cb){
				cb(null, currentUser);
			}
		}).fail(function(){
			if(cb!=null){
				cb("User is not Logged In");
			}
		});
	};

	 logoutUser(cb){
		$.ajax({
			headers: {
				Accept: "application/json; charset=utf-8"
			},
			url:this.deployPrefix+'/auth/logout',
			method:'POST'
		}).done(function(currentUser, statusCode){
			console.log("In Response " + statusCode);
			if(statusCode!='success'){
				if(cb){
					cb("User is not Logged In", response);
				}
			}else if(cb){
				cb(null, currentUser);
			}
		}).fail(function(){
			if(cb!=null){
				cb("User is not Logged In");
			}
		});
	};


}
