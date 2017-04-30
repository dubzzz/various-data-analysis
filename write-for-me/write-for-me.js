// Hash tags

var START_TOKEN = "< START >";
var END_TOKEN = "< END >";
//var words_regex = /(^|\s)([^\s]+)($|\s)/g
var words_regex = /([^\s]+)/g

function retrieve_tokens(tokenize_regex, msg) {
	return ms
}

function TransitionsHandler() {
	this.transitions = {};
	this.total_transitions = 0;
}

TransitionsHandler.prototype.append = function(nextid) {
	++this.total_transitions;
	if (this.transitions[nextid] !== undefined) {
		++this.transitions[nextid];
	}
	else {
		this.transitions[nextid] = 1;
	}
}

TransitionsHandler.prototype.next = function() {
	var r = Math.floor(Math.random() * this.total_transitions);
	var or = r;
	var possible = Object.keys(this.transitions);
	for (var idx = 0 ; idx != possible.length ; ++idx) {
		r -= this.transitions[possible[idx]];
		if (r < 0) { return possible[idx]; }
	}
	console.log("No next possible with r: ", or, " and transitions: ", this.transitions);
	return undefined;
}

function Learner() {
	this.token_transition = {};
	this.token_transition[END_TOKEN] = 0;
	this.token_transition[START_TOKEN] = 1;
	this.words = [END_TOKEN, START_TOKEN];
	this.transitions = [ new TransitionsHandler(), new TransitionsHandler() ];
	this.num_words = 0;
	this.num_sentences = 0;
};

Learner.prototype.update_from_sentence = function(sentence) {
	var inserted_transitions = "";
	var tokens = sentence.split(' ');
	var previous_token = START_TOKEN;
	for (var tokenid = 0 ; tokenid != tokens.length ; ++tokenid) {
		var token = tokens[tokenid];
		if (token.length === 0) { continue; }

		var token_transition_id = this.token_transition[token];
		if (token_transition_id === undefined) {
			token_transition_id = this.transitions.length;
			this.token_transition[token] = token_transition_id;
			this.transitions.push(new TransitionsHandler());
			this.words.push(token);
		}
		++this.num_words;
		this.transitions[this.token_transition[previous_token]].append(token_transition_id);
		previous_token = token;

		if (inserted_transitions.length > 0) {
			inserted_transitions += " -> ";
		}
		inserted_transitions += "'" + token + "'";
	}
	//console.log("Learnt: ", inserted_transitions);
	if (previous_token === START_TOKEN) { return; }
	++this.num_sentences;
	this.transitions[this.token_transition[previous_token]].append(this.token_transition[END_TOKEN]);
}

Learner.prototype.update_from_message = function(msg) {
	var sentences = msg.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').split(".");
	for (var idx = 0 ; idx != sentences.length ; ++idx) {
		this.update_from_sentence(sentences[idx]);
	}
}

Learner.prototype.update = function(data) {
	for (var idx = 0 ; idx != data.length ; ++idx) {
		var msg = data[idx].text;
		if (msg === undefined) { continue; }

		var lang = data[idx].lang;
		if (lang !== "fr") { continue; }

		this.update_from_message(msg);
	}
}

Learner.prototype.write = function() {
	var currentid = this.token_transition[START_TOKEN];
	var words = [];
	while (true) {
		currentid = +this.transitions[currentid].next();
		if (currentid === this.token_transition[END_TOKEN]) { break; }

		//console.log("Word @", currentid, " is ", this.words[currentid])
		words.push(this.words[currentid]);
	}
	return words.join(' ') + '.';
}
