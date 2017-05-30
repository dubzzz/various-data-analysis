function all_of(elements, predicate) {
	for (var idx = 0 ; idx != elements.length ; ++idx) {
		if (! predicate(elements[idx])) { return false; }
	}
	return true;
}

function none_of(elements, predicate) {
	return all_of(elements, e => ! predicate(e));
}

function one_of(elements, predicate) {
	return ! none_of(elements, predicate);
}

function accumulate(elements, initial, accumulator) {
	for (var idx = 0 ; idx != elements.length ; ++idx) {
		initial = accumulator(initial, elements[idx]);
	}
	return initial;
}
