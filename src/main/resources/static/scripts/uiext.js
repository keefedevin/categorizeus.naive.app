var poll = false;
var pollInterval = null;
var pendingUpdates = [];
var tagShortcuts = [];
var updateTimer;
var messageResetCount = 100;

var initializeExt = function(){
  $("#btnCategorizeUs").click(function(){
    var settingHtml = ui.tmpl("tmplSettings",ui.settings);
    var controls = $("#editor").html(settingHtml);
    controls.find(".btnSaveSettings").click(function(){
      var pollRate = parseInt(controls.find(".txtPollRate").val());
      console.log("Poll Rate Read as " + pollRate);
      ui.settings.pollRate = pollRate;
      ui.settings.updateBatchSize =  parseInt(controls.find(".txtUpdateBatchSize").val());
      ui.settings.uiUpdateRate =  parseInt(controls.find(".txtUpdateRate").val());

      if(poll){
        stopPolling();
        startPolling();
      }
      controls.empty();
    });
    controls.find(".closeButton").click(function(){
      controls.empty();
    });
  });
  $("#btnTag").click(function(){
      $(".taggingStuff").toggleClass("unseen");
	    if(tagSelectMode){
	      Mousetrap.bind("1", function(){
  			     var tags = $("#txtTagSearch").val();
				         tagSelectedMessages(tags);
	      });
	    }else{
	      Mousetrap.unbind("1");
	      for(var i=0; i<tagShortcuts.length;i++){
	      	Mousetrap.unbind((i+2)+"");
	      }
	      tagShortcuts = [];
	      $("#tagPresets").empty();
	      $("#btnSearch").html("Search");
	    }
    	return;
	});
  $("#btnAddTag").click(function(){
		var tags = $("#txtTagSearch").val();
		var which = tagShortcuts.length+2;
		tagShortcuts.push(tags);
		$("#tagPresets").append("["+which+"]"+tags+"&nbsp;");
		Mousetrap.bind(""+which, (function(tags){
			return function(){
				tagSelectedMessages(tags);
			}
		})(tags));
	});
	$("#btnPlay").click(function(){
		poll = !poll;
		if(poll){
			startPolling();
		}else {
			stopPolling();
		}
	});
}

var startPolling = function(){
	$("#btnPlay").removeClass("playButton");
	$("#btnPlay").addClass("stopButton");
	pollInterval = setInterval(function(){
		checkForUpdates();
	}, ui.settings.pollRate);
	addMessageUpdate();
};
var checkForUpdates = function(){
	ui.checkForUpdates(updateMessages);
};

var stopPolling = function(){
	$("#btnPlay").removeClass("stopButton");
	$("#btnPlay").addClass("playButton");
	clearInterval(pollInterval);
	clearTimeout(updateTimer);
};
var addMessageUpdate = function(){
	var addedThisBatch = 0;
	while(pendingUpdates.length>0 && addedThisBatch < ui.settings.updateBatchSize){
		var aMessage = pendingUpdates.shift();
		console.log("Adding " + aMessage.message.id);
		if(!ui.id2messages[aMessage.message.id]){
			addedThisBatch++;
			ui.totalMessages++;
			ui.id2messages[aMessage.message.id] = aMessage;
			ui.currentMessages.unshift(aMessage);
			var appliedTemplate = $(ui.tmpl("tmplBasicDocument",aMessage));
			var newMessage = null;
			if(ui.query.sortBy=="desc"){
				newMessage = $("#content").prepend(appliedTemplate);
			}else{
				newMessage = $("#content").append(appliedTemplate);
			}
			wireMessageSummary(aMessage, appliedTemplate);
		}
	}
	var thisManyTooMany = ui.totalMessages - messageResetCount;
	for(var i=0; i<thisManyTooMany;i++){
		var staleMessage = ui.currentMessages.pop();
		var messageSelector = ".categorizeus"+staleMessage.message.id;
		ui.totalMessages--;
		$(messageSelector).remove();
	}
	var messagesInFrame = $(".basicDocument").length;

	console.log("Total in grid " + messagesInFrame + "Added this Batch " + addedThisBatch + " still pending " + pendingUpdates.length + " batch " + ui.settings.updateBatchSize);
	updateTimer = setTimeout(addMessageUpdate, ui.settings.uiUpdateRate);
};
var updateMessages = function(err, messages){
	var s = "";
	for(var i = 0; i<messages.length; i++){
		var aMessage = messages[i];
		s = s + aMessage.message.id+",";
		pendingUpdates.push(aMessage);
		//TODO dupes in here somehow?
		//debugger;
		/*if(currentMessages.length==0 ||
			parseInt(aMessage.message.id) > parseInt(currentMessages[0].message.id)){
			pendingUpdates.push(aMessage);//TODO dupes in here somehow?
		}*/
	}
	console.log("Add these " + s);
}
