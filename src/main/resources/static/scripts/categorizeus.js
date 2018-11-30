/**
This is the javascript http api for a categorize.us server, using jquery.
There should be no UI specific code in this file, it should all be in callbacks.
**/
//var deployPrefix = "https://ectiaevu68.execute-api.us-west-2.amazonaws.com/testing";
var deployPrefix = "/v1";

var tagMessages = function(tagArray, messageArray, cb){
	var payload = {
		tags:tagArray,
		messages:messageArray
	};
	$.ajax({
		url:deployPrefix+'/tag/',
		accepts:'application/json',
		method:'PUT',
		contentType:"application/json",
		data:JSON.stringify(payload)
	}).done(function(message, statusCode){
		if(cb){//TODO check for status code here?
			cb(null, message);
		}
	}).fail(function(){
		if(cb){
			cb("Can't tag messages for some reason");
		}
	});
};

var tagSearch = function(tagArray, cb){
	var payload = {
		tags:tagArray
	};
	$.ajax({
		url:deployPrefix+'/tag/',
		accepts:'application/json',
		method:'POST',
		contentType:"application/json",
		data:JSON.stringify(payload)
	}).done(function(messages, statusCode){
		if(statusCode!='success'){
			if(cb){
				cb("Error doing tag search!");
			}
		}else if(cb){
			cb(null, messages);
		}
	});
};

var tagSearchThread = function(tagArray, cb){
	var threadCriteria = {
		searchTags:tagArray,
		transitiveTags:["repliesTo"]
	};
	searchThreadCriteria(threadCriteria, cb);
};

var searchThreadCriteria = function(threadCriteria, cb){
	$.ajax({
		headers: {
			Accept: "application/json; charset=utf-8"
		},
		url:deployPrefix+'/messages?tags='+threadCriteria.searchTags.join(),
		method:'GET'
	}).done(function(messageThread, statusCode){//TODO fail handler
		if(statusCode!='success'){
			if(cb){
				cb("Error doing tag search!");
			}
		}else if(cb){
			cb(null, messageThread);
		}
	});
};

var loadMessage = function(id, cb){
	$.ajax({
		url:deployPrefix+'/msg/'+id,
		accepts:'application/json'
	}).done(function(message, statusCode){
		console.log("In Response " + statusCode);
		if(statusCode!='success'){
			if(cb){
				cb("Error doing doc load!", response);
			}
		}else if(cb){
			cb(null, message);
		}
	});

};

var createMessage = function(message, cb){
	$.ajax({
		url:deployPrefix+'/msg/',
		method:'POST',
		contentType:"application/json",
		data:JSON.stringify(message)
	}).done(function(response, statusCode){
		console.log("In Response " + statusCode);
		console.log(response);
		if(statusCode!='success'){
			if(cb){
				cb("Please Login to Post", response);
			}
		}else if(cb){
			cb(null, response);
		}
	}).fail(function(){
		cb("Please Login to Post");
	});
};

var createEncodedMessage = function(message, files, cb){
  var reader = new FileReader();
  reader.addEventListener("load", function(){
    message.attachment = {
      name:files[0].name,
      type:files[0].type,
      dataURL:reader.result,
      size:files[0].size
    }
    createMessage(message, cb);
  });
  if(files[0]!=null){
    console.log(files[0]);
    if(files[0].type.startsWith("image") && files[0].size<1024*1024*2){//TODO hard coded, ick
      reader.readAsDataURL(files[0]);
    }else{
      alert("Invalid Attachment detected, please try again!");
    }
  }
}
function hex(buffer) {
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
var loginUser = function(username, password, cb){


	var buffer = new TextEncoder("utf-8").encode(password);
		crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
		var user = {
			username:username,
			passhash:hex(hash)
		};
		$.ajax({
			url:deployPrefix+'/auth/login',
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

var fetchCurrentUser = function(cb){
	$.ajax({
		url:deployPrefix+'/user/',
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

var logoutUser = function(cb){
	$.ajax({
		url:deployPrefix+'/user/',
		method:'DELETE',
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


var registerUser = function(username, password, cb){
	var user = {
		username:username,
		password:password
	};
	$.ajax({
		url:deployPrefix+'/user/',
		method:'PUT',
		contentType:"application/json",
		data:JSON.stringify(user)
	}).done(function(response, statusCode){
		console.log("In Response " + statusCode);
		if(statusCode!="success"){
			if(cb){
				cb("Error registering! Please try again");
			}
		}else{
			if(cb){
				cb(null, response);//TODO what should this response be?
			}
		}
	});
}
