// Hash tags

var num_slots = 60; //number of slots to consider
var slot_length = 60 * 1000; //number of milliseconds in the slot
var top_size = 10;

function array_of(size) {
	var arr = [];
	for (; size > 0 ; --size) {
		arr.push(0);
	}
	return arr;
}

function retrieve_tags(hashtag_regex, msg) {
	var tags = [];
	var m;
	do {
		m = hashtag_regex.exec(msg);
		if (m) {
			tags.push(m[2].toLowerCase());
		}
	} while (m);
	return tags;
}

var last_id = 0;
function HashTag(tag_name) {
	this.id = 0;
	this.cursor_position = 0;
	this.tag_name = tag_name;
	this.hit_count = 0;
	this.hit_history = array_of(num_slots);
};
HashTag.prototype.rotate_by = function(raw_rotate_value) {
	var rotate_value = raw_rotate_value < num_slots ? raw_rotate_value : num_slots;
	
	// decrease the hit_count & rotate
	var slot_id = this.cursor_position > 0 ? this.cursor_position -1 : num_slots -1;
	for (var offset = 0 ; offset != raw_rotate_value ; ++offset) {
		--slot_id;
		if (slot_id < 0) {
			slot_id += num_slots;
		}
		this.hit_count -= this.hit_history[slot_id];
		this.hit_history[slot_id] = 0;
	}

	this.cursor_position -= raw_rotate_value;
	while (this.cursor_position < 0) {
		this.cursor_position += num_slots;
	}
}
HashTag.prototype.seen = function() {
	this.id = ++last_id;
	++this.hit_count;
	++this.hit_history[this.cursor_position];
}

function Ranking($top, hashtag_regex) {
	this.$top = $top;
	this.hashtag_regex = hashtag_regex;
	this.hashtags = [];
	this.last_update = Date.now();
};

Ranking.prototype.update = function(data) {
	var previous_update = this.last_update;
	var current_update = Date.now();
	this.last_update = current_update;

	// Previous ranking data
	var prev_ranking_tags = [];
	var prev_max_rank = Math.min(top_size, this.hashtags.length);
	for (var r = 0 ; r != prev_max_rank ; ++r) {
		prev_ranking_tags.push(this.hashtags[r].tag_name);
	}

	// As time goes-by, rotate the hashtags
	var rotate_value = Math.floor(current_update / slot_length) - Math.floor(previous_update / slot_length);
	if (rotate_value > 0) {
		for (var idx = 0 ; idx != this.hashtags.length ; ++idx) {
			this.hashtags[idx].rotate_by(rotate_value);
		}
	}

	// Build a map tag_name -> hashtag
	var name_to_hashtag = {};
	for (var idx = 0 ; idx != this.hashtags.length ; ++idx) {
		name_to_hashtag[this.hashtags[idx].tag_name] = this.hashtags[idx];
	}

	// Append data to their correponding hashtags
	for (var idx = 0 ; idx != data.length ; ++idx) {
		var msg = data[idx].text;
		if (msg === undefined) { continue; }
		var lang = data[idx].lang;
		if (lang !== "fr") { continue; }

		var tags = retrieve_tags(this.hashtag_regex, msg);
		for (var tagid = 0 ; tagid != tags.length ; ++tagid) {
			var tag = tags[tagid];
			var hashtag = name_to_hashtag[tag];
			if (hashtag === undefined) {
				hashtag = new HashTag(tag);
				name_to_hashtag[tag] = hashtag;
				this.hashtags.push(hashtag);
			}
			hashtag.seen();
		}
	}

	// Sort hashtags by hit_count
	this.hashtags.sort(function (a, b) { return (a.hit_count !== b.hit_count) ? (b.hit_count - a.hit_count) : (b.id - a.id); });

	// Print the top
	var max_rank = Math.min(top_size, this.hashtags.length);
	var same_ranking = prev_max_rank === max_rank;
	if (same_ranking) {
		for (var r = 0 ; r != prev_max_rank ; ++r) {
			if (this.hashtags[r].tag_name !== prev_ranking_tags[r]) {
				same_ranking = false;
				break;
			}
		}
	}
	if (! same_ranking) {
		this.$top.empty();
		for (var r = 0 ; r != max_rank ; ++r) {
			var $at_rank = $("<li/>");
			var $label = $("<span/>");
			$label.addClass("tag-name");
			$label.text(this.hashtags[r].tag_name);
			var $hit = $("<span/>");
			$hit.addClass("hit-count");
			$hit.text(this.hashtags[r].hit_count);
			$at_rank.append($hit);
			$at_rank.append($label);
			this.$top.append($at_rank);
		}
	}
	else {
		for (var r = 0 ; r != max_rank ; ++r) {
			var $hit = this.$top.children().eq(r).find(".hit-count");
			$hit.text(this.hashtags[r].hit_count);
		}
	}
}


// RTM connection

var endpoint = "wss://open-data.api.satori.com";
var appKey = "9BABD0370e2030dd5AFA3b1E35A9acBf";
var channel = "Twitter-statuses-sample";
var rankings = [];

var rtm = new RTM(endpoint, appKey);
rtm.on("enter-connected", function() {
	console.log("Connected to RTM!");
});

rtm.on("error", function(error) {
	console.error("Error connecting to RTM: " + error.message);
});

var subscription = rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE);
subscription.on('rtm/subscription/data', function(pdu) {
	for (var idx = 0 ; idx != rankings.length ; ++idx) {
		rankings[idx].update(pdu.body.messages);
	}
});

rtm.start();
