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
