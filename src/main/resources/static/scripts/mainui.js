var tmplBasicDocument;
var tmplBasicDocumentEdit;
var tmplLogin;
var tmplRegister;
var tmplIndividualComment;
var tmplNavigation;


var currentUser = null;
var tagSelectMode = false;
var currentThread;
var currentMessages = null;
var poll = false;
var pollInterval = null;

var initialize = function(dontDoInitialSearch){
	tmplBasicDocument = Handlebars.compile($("#tmplBasicDocument").html());
	tmplBasicDocumentEdit = Handlebars.compile($("#tmplBasicDocumentEdit").html());//notice the pattern, probably put these in an object and generalize
	tmplLogin = Handlebars.compile($("#tmplLogin").html());
	tmplIndividualComment = Handlebars.compile($("#tmplIndividualComment").html());
	tmplNavigation= Handlebars.compile($("#tmplNavigation").html());
	fetchCurrentUser(function(err, user){
		if(err!=null){
			console.log("Nobody is logged in");
			console.log(err);
			return;
		}
		currentUser = user;
		$("#btnShowLogin").prop("value", "logout");
		console.log(user);
		$(".userGreeting").html("Hi, "+user.username+"!");
	});
	  if(!dontDoInitialSearch){
	  	tagSearchThread([], displayMessages);
	  }
	$('#signinButton').click(function() {
		window.location.href = "/v1/auth/oauth/google";
  	});
	$("#btnShowLogin").click(function(){
		if(currentUser==null){
			console.log("Clicking Login Button");
			displayLoginForm("#editor");
		}else{
			logoutUser(function(err, user){
				if(err!=null){
					$(".userGreeting").html("<h1> "+err+"</h1>");
					return;
				}
				currentUser = null;
				$("#btnShowLogin").prop("value", "login");
				$(".userGreeting").html("");
			});

		}
	});
	$("#btnPost").click(function(){
		if(currentUser==null){
			displayLoginForm("#editor");
		}else{
			displayEditForm("#editor", {}, function(){
				tagSearchThread(lastTags, displayMessages);
			});
		}
	});

	$("#btnSearch").click(function(){
		if(tagSelectMode){
    		tagSelectedMessages();
    		return;
		}
		var tags = $("#txtTagSearch").val();
		var tagArray = stringToTags(tags);
		tagSearchThread(tagArray, displayMessages);
	});

	$("#btnTag").click(function(){

	    tagSelectMode = !tagSelectMode;
	    $("#btnTag").toggleClass('selected');
	    $(".basicDocument").toggleClass('selectable');
	    if(tagSelectMode){
	      $("#btnSearch").html("Apply Tag");
	    }else{
	      $("#btnSearch").html("Search");
	    }
    	return;

	});
	
	$("#btnPlay").click(function(){
		poll = !poll;
		if(poll){
			$("#btnPlay").removeClass("playButton");
			$("#btnPlay").addClass("stopButton");
			pollInterval = setInterval(function(){
					tagSearchThread(lastTags, displayMessages);
				}, 3000);
		}else {
			$("#btnPlay").removeClass("stopButton");
			$("#btnPlay").addClass("playButton");	
			clearInterval(pollInterval);	
		}
	});
}


var stringToTagsByDelim = function(str, delim){
	var allTags = str.split(delim);
	var tagArray = [];
	for(var i=0; i<allTags.length;i++){
		var tag = allTags[i].trim();
		if(tag.length>0){
			tagArray.push(tag);
		}
	}
	return tagArray;
}

var stringToTags = function(str){
	var spaceTags = stringToTagsByDelim(str, " ");
	var commaTags = stringToTagsByDelim(str, ",");
	if(spaceTags.length>commaTags.length) return spaceTags;
	return commaTags;
}

var tagSelectedMessages = function(){
	var tags = $("#txtTagSearch").val();
	var tagArray = stringToTags(tags);

	var whichTagged = [];
	$('.basicDocument.selected').each(function () {
		whichTagged.push(this.id);
	});

	if(tagArray.length==0){
		$("#status").html("<h1>Please provide tags when tagging</h1>");
		return;
	}
	if(whichTagged.length==0){
		$("#status").html("<h1>Please select messages when tagging</h1>");
		return;
	}
	tagMessages(tagArray, whichTagged,function(err, message){
		    $('.basicDocument.selected').toggleClass('selected');
			tagSearchThread(lastTags, displayMessages);
	
			if(err!=null){
				$("#status").html(err);
			}else{
				$("#status").html("Tagged Messages Successfully");
			}
	});
}


var displayEditForm = function(container, sourceMsg, cb){//#TODO don't just replace
	var controls = $(container).append(tmplBasicDocumentEdit(sourceMsg));
	controls.find(".inputMsgBtn").click(dynamicEditSubmit(controls, cb));
	controls.find(".closeButton").click(function(event){
		controls.find(".basicDocumentEdit").remove();
	});
}

var displayLoginForm = function(container){ //#TODO hey we are seeing a template pattern here, let's generalize it
	var controls = $(container).html(tmplLogin({}));
	controls.find(".btnLogin").click(dynamicLogin(controls));
	controls.find(".closeButton").click(function(){
		controls.empty();
	});
}

var displayRegisterForm = function(container){ //#TODO hey we are seeing a template pattern here, let's generalize it
	var controls = $(container).html(tmplRegister({}));
	controls.find(".btnRegister").click(dynamicRegister(controls));
}

var handleGridDocumentClick = function(event, template, message){
	if(tagSelectMode ){
    //&& event.target.tagName != "IMG" && event.target.tagName != "INPUT"
		console.log(message);
		template.toggleClass('selected');
    	event.preventDefault();
	}else{
	  if(event.target.tagName == "IMG"){
	    console.log("You clicked an image, way to go");
      //event.preventDefault();
	  }
	}
}
var wireMessageSummary = function(aMessage, appliedTemplate){
	appliedTemplate.bind('click',
	   (function(template, message){
					return function(event){
					      handleGridDocumentClick(event, template, message);
					}
	   })(appliedTemplate, aMessage)
	);
	var qry = ".basicDocument.categorizeus"+aMessage.message.id;
	var newMessageView = $("#content").find(qry);
	newMessageView.find(".viewButton").click((function(message){
		return function(event){
			console.log("View button is clicked for " + message.message.id);
			loadMessage(message.message.id, function(error, messageThread){
				console.log(messageThread);
				displayMessageThread(message, messageThread);
			});
		};
	})(aMessage));
};


var displayMessages = function(err, messages){
	currentMessages = messages;
	$("#content").empty();
	for(var i=0; i<messages.length;i++){
		var aMessage = messages[i];
		var appliedTemplate = $(tmplBasicDocument(aMessage));
		var newMessage = $("#content").append(appliedTemplate);
		wireMessageSummary(aMessage, appliedTemplate);
	}
	$("#content").append($(tmplNavigation({})));
	$("#content").find(".nextLink").click(function(event){
		nextPage(displayMessages);
	});
	$("#content").find(".previousLink").click(function(event){
		previousPage(displayMessages);
	});
};

var displayMessageThread = function(message, thread){
	$("#content").empty();
	currentMessage = message;

	var id2message = {};
	id2message[message.message.id] =  message;
	for(var msg of thread){
		id2message[msg.message.id] = msg;
	}
	for(var msg of thread){
		if(!id2message[msg.message.repliesTo].children){
			id2message[msg.message.repliesTo].children = [];
		}
		id2message[msg.message.repliesTo].children.push(msg);
	}

	var traverseThread = function(msg, depth){
		addComment(msg, depth);
		msg.visited = true;

		if(msg.children)
		for(var reply of msg.children){
			if(!reply.visited){
					traverseThread(reply, depth+1);
			}
		}
	}
	traverseThread(message, 0);
//newMessageView.find(".replyButton").click(displayMessageEditorCB(message, newMessageView));
}
var addComment = function(message, depth){
	var leftPad = 65 + depth*35;
	var appliedTemplate = $(tmplIndividualComment(message));
	var newFullMessage = $("#content").append(appliedTemplate);
	appliedTemplate.css("padding-left", leftPad+"px");
	var newMessageView = $("#content").find(".categorizeus"+message.message.id);
	newMessageView.find(".closeButton").click((function(message, messageView){
			return function(event){
				tagSearchThread(lastTags, displayMessages);
			};
	})(message, newMessageView));
	newMessageView.find(".replyButton").click((function(message, messageView){
			return function(event){
				console.log("Reply to " + message.message.id);
				displayEditForm("#editor", {}, function(){
					loadMessage(currentMessage.message.id, function(error, messageThread){
						console.log(messageThread);
						displayMessageThread(currentMessage, messageThread);
					});
				});
				$(".repliesToId").val(message.message.id);
			};
	})(message, newMessageView));
}
var dynamicLogin = function(el){
	return function(){
		var username = el.find(".txtUsername").val();
		var password = el.find(".txtPassword").val();
		loginUser(username, password, function(err, user){
			if(err!=null){
				$(".userGreeting").html("<h1>"+err+"</h1>");
			}else{//TODO merge with the logout, get current user stuff
				currentUser = user;
				$("#btnShowLogin").prop("value", "logout");
    		$(".userGreeting").html("Hi, "+user.username+"!");
			}
			el.empty();
		});
	};
}

var dynamicEditSubmit = function(el, cb){

	return function(){
		console.log("Dynamically bound control OK");
		var title = el.find(".inputMsgTitle").val();
		var tags = el.find(".inputMsgTags").val();
		var body = el.find(".inputMsgBody").val();
		var id = el.find(".inputMsgId").val();
		var repliesToId = el.find(".repliesToId").val();
		var file = el.find(".inputFileAttachment");
		var isNew = (!id) || id.length==0;
		console.log(id + " is new? " + isNew + " " + title + " & " + body);
		if(repliesToId!=null && repliesToId.length>0){
			console.log("Posting a reply to " + repliesToId);
		}
    el.find(".basicDocumentEdit").prepend("<h1>Processing your new message, please wait......</h1>");
		if(isNew){
			var newMessage = {
				body:body,
				title:title,
				tags:tags
			};
			if(repliesToId!=null&& repliesToId.length>0){
				newMessage.repliesTo = repliesToId;
				newMessage.rootRepliesTo = currentMessage.message.id;
			}
			var handleCreatedMessage = function(err, response){
				if(err!=null){
					$("#status").append("<p>Error: " + err + "</p>");
				}else{
					$("#status").append("<p>Created new document with id " + response.id + "</p>");
				}
				el.empty();
				if(cb!=null){
					newMessage.id = response.id;
					cb(newMessage);
				}
			}
			if(file.val()!==''){//file[0].files.length?
				console.log("Found an attached file");
				console.log(file[0].files);
				createMessageWithAttachment(newMessage, file[0].files, handleCreatedMessage);
				return;
			}
			createMessage(newMessage, handleCreatedMessage);

		}else{
			$("#status").append("<p>Currently, editing existing docs not supported. Clear and try again.</p>");
		}
		el.empty();

	};
}
