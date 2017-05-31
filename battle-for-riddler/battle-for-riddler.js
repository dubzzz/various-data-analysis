function spread_accross_buckets(total_population, num_buckets) {
	/**
	 * Spread <total_population> accross <num_buckets> slots
	 * Population is randomly spread accross buckets
	 *
	 * Both <total_population> and <num_buckets> should be strictly positive integers
	 *
	 * Output is such as:
	 * - array of <num_buckets> elements
	 * - for all i in [ 0; <num_buckets> [, output[i] is a positive integer
	 * - sum of output = <total_population>
	 */

	// build uniform strategy
	var strength = 0;
	while (strength == 0) {//Math.random() may have returned 0 for every entry
		var MAX_BUCKET_VALUE = Math.floor(Number.MAX_SAFE_INTEGER / num_buckets);//avoid integer overflow when suming
		var strategy = new Array();
		for (var i = 0 ; i != num_buckets ; ++i) {
			var current = Math.floor(MAX_BUCKET_VALUE * Math.random());
			strategy.push(current);
			strength += current;
		}
	}

	// normalize strategy
	var normalized_strength = 0;
	for (var i = 0 ; i != num_buckets ; ++i) {
		var ratio = 1. * total_population / strength;
		strategy[i] = Math.floor(ratio * strategy[i]);
		normalized_strength += strategy[i];
	}

	// add missing population
	for (var s = normalized_strength ; s != total_population ; ++s) {
		++strategy[Math.floor(num_buckets * Math.random())]
	}
	return strategy;
}

function sorted_against(input, values, comparator) {
	/**
	 * Sort an <input> array according to another array <values>
	 * and applying the comparator <comparator>
	 *
	 * <input> and <values> should not be impacted
	 */
	var data = [];
	for (var i = 0 ; i != input.length ; ++i) {
		data.push({in: input[i], v: values[i]});
	}
	data.sort((a,b) => comparator(a.v, b.v));
	var sorted = [];
	for (var i = 0 ; i != data.length ; ++i) {
		sorted.push(data[i].in);
	}
	return sorted;
}

var STRATEGY_POPULATION = 100;
var STRATEGY_SIZE = 10;
var MAX_MUTATIONS = 100;

var BATTLE_WIN = 3;
var BATTLE_EQUALITY = 1;

function generate_strategies(num) {
	var strategies = [];
	for (var i = 0 ; i != num ; ++i) {
		strategies.push(spread_accross_buckets(STRATEGY_POPULATION, STRATEGY_SIZE));
	}
	return strategies;
}

function run_battle(st1, st2) {
	/**
	 * Run a battle between strategy <st1> and <st2>
	 * <st1> and <st2> must have the same size (or number of buckets)
	 * 
	 * 1: st1 wins
	 * 2: st2 wins
	 * 0: no one wins
	 */

	var score1 = 0;
	var score2 = 0;
	for (var i = 0 ; i != st1.length ; ++i) {
		if (st1[i] > st2[i]) { score1 += 2*(i+1); }
		else if (st1[i] < st2[i]) { score2 += 2*(i+1); }
		else {
			score1 += i+1;
			score2 += i+1;
		}
	}
	return score1 < score2 ? 2 : (score1 > score2 ? 1 : 0);
}

function score_battle(st1, st2) {
	/**
	 * Compute the score of <st1>,<st2> for the battle facing <st1> to <st2>
	 * 
	 * Output is an array with first corresponding to <st1>'s score, second to <st2>'s
	 * win    = BATTLE_WIN pts
	 * nul    = BATTLE_EQUALITY pts
	 * defeat = 0 pts
	 */
	var winner = run_battle(st1, st2);
	if (winner == 1) { return [BATTLE_WIN, 0]; }
	else if (winner == 2) { return [0, BATTLE_WIN]; }
	else { return [BATTLE_EQUALITY, BATTLE_EQUALITY]; }
}

function score_against_panel(panel_strategies, strategy) {
	/**
	 * Compute the score of <strategy> facing all the strategies in <panel_strategies>
	 * 
	 * win    = BATTLE_WIN pts
	 * nul    = BATTLE_EQUALITY pts
	 * defeat = 0 pts
	 */
	return accumulate(panel_strategies, 0, (acc, s) => acc + score_battle(strategy, s)[0]);
}

function mutated_strategy(strategy) {
	/**
	 * Derived an incoming <strategy> into a mutated version of itself
	 *
	 * Input strategy should not be modified
	 * Output strategy has the same size and population, it must be another array but might be equal
	 */

	var mutated = strategy.slice();
	var num_mutations = Math.floor(MAX_MUTATIONS * Math.random());
	for (var i = 0 ; i != num_mutations ; ++i) {
		var idx1 = Math.floor(strategy.length * Math.random());
		var idx2 = Math.floor(strategy.length * Math.random());
		if (idx1 == idx2) { continue; }
		if (mutated[idx1] < 1) { continue; }
		--mutated[idx1];
		++mutated[idx2];
	}
	return mutated;
}

/*

var MAX_FAILURES = 5;

var NUM_KEPT_STRATEGIES = 10;
var NUM_MUTATE_STRATEGIES = 80;
var NUM_STRATEGIES = 100;

var NUM_PANEL_STRATEGIES = 1000;

function compute_scoreboard(panel_strategies, strategies) {
	var scores = [];
	for (var i = 0 ; i != strategies.length ; ++i) {
		scores.push(compute_score(panel_strategies, strategies[i]));
	}
	return scores;
}

function run_all_battles(panel_strategies, strategies) {
	var scores = compute_scoreboard(panel_strategies, strategies);
	return sorted_strategies(strategies, scores);
}

function mutated_strategies(panel_strategies, strategies) {
	var sorted = run_all_battles(panel_strategies, strategies);

	var NUM_UPDATED = NUM_KEPT_STRATEGIES + NUM_MUTATE_STRATEGIES;
	for (var i = NUM_KEPT_STRATEGIES ; i != NUM_UPDATED ; ++i) {
		sorted[i] = mutated_strategy(sorted[i]);
	}
	for (var i = NUM_UPDATED ; i != NUM_STRATEGIES ; ++i) {
		var mutate_from = Math.floor(NUM_KEPT_STRATEGIES * Math.random());
		sorted[i] = mutated_strategy(sorted[mutate_from]);
	}
	return sorted;
}

function suggest_strategy(steps) {
	var strategies = generate_strategies(NUM_STRATEGIES);
	var panel_strategies = generate_strategies(NUM_PANEL_STRATEGIES);
	if (steps !== undefined) {
		while (steps-- > 0) {
			strategies = mutated_strategies(panel_strategies, strategies);
		}
	}
	else {
		var current_best = 0;
		var num_failures = 0;
		while (num_failures < MAX_FAILURES) {
			strategies = mutated_strategies(panel_strategies, strategies);
			var previous_best = current_best;
			current_best = compute_score(panel_strategies, strategies[0]);
			if (previous_best < current_best) { num_failures = 0; }
			else { ++num_failures; }
		}
	}
	return run_all_battles(panel_strategies, strategies)[0];
}*/
