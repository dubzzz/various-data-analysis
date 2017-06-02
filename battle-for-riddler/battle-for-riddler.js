function normalize_array(total_population, array) {
	/**
	 * Normalize <array> to <total_population>
	 * - <total_population> must be an Integer
	 * - <array> must be an array constaining at least one element
	 *
	 * An <array> with null values only is supposed to be equivalent to [1, 1, ... , 1]
	 *
	 * Output satisfy:
	 * - array having the same size as <array>
	 * - it contains only integers
	 * - the sum of its integers is equal to total_population
	 * - all its elements satisfy: Math.floor(ratio * array[i]) <= element_value <= Math.ceil(ratio * array[i])
	 *     where ratio = <total_population> / sum(<array>)
	 */

	var strength = accumulate(array, 0, (acc, cur) => acc + cur);
	var ratio = 1. * total_population / (strength == 0 ? array.length : strength);

	var out = [];
	var gaps = [];

	// normalize
	var normalized_strength = 0;
	for (var i = 0 ; i != array.length ; ++i) {
		var inf_value = Math.floor(strength == 0 ? ratio : ratio * array[i]);
		var sup_value = Math.ceil(strength == 0 ? ratio : ratio * array[i]);

		out.push(inf_value);
		normalized_strength += inf_value;
		for (var j = inf_value ; j != sup_value ; ++j) {
			gaps.push(i);
		}
	}

	// add missing population
	for (var s = normalized_strength ; s != total_population ; ++s) {
		var id = Math.floor(gaps.length * Math.random());
		++out[gaps[id]];
		gaps[id] = gaps[gaps.length -1];
		gaps.splice(-1);
	}
	return out;
}

function random_normalized_array(total_population, num_buckets) {
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

	return normalize_array(total_population, generate_n(num_buckets, () => Math.random()));
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

function max_against(input, values) {
	if (values.length === 0) { return undefined; }
	
	var max_idx = 0;
	for (var i = 1 ; i != values.length ; ++i) {
		if (values[i] > values[max_idx]) {
			max_idx = i;
		}
	}
	return input[max_idx];
}

var STRATEGY_POPULATION = 100;
var STRATEGY_SIZE = 10;
var MAX_MUTATIONS = 2;
var PERCENT_KEPT = 10;

var BATTLE_WIN = 3;
var BATTLE_EQUALITY = 1;

function generate_strategies(num) {
	var strategies = [];
	for (var i = 0 ; i != num ; ++i) {
		strategies.push(random_normalized_array(STRATEGY_POPULATION, STRATEGY_SIZE));
	}
	return strategies;
}

function count_better_strategies_helper(strategy, already_asked, num_buckets, total_population, doubled_target_score) {
	/**
	 * Count the number of strategies able to beat <strategy>
	 * and having the following criteria:
	 * - it earns more than <doubled_target_score>/2 points over <strategy> on [0,num_buckets[
	 * - over [0,num_buckets[, its population is <total_population>
	 *
	 * Inputs have to be such has:
	 * - num_buckets >= 0
	 * - total_population >= 0
	 * - doubled_target_score >= 0
	 * - already_asked[i][j][k] is defined equal to -1 for all unknown configuration
	 *   with i in [0;num_buckets[, j in [0;total_population[ and k in [0;max(0,doubled_target_score)]
	 */

	if (num_buckets === 0) {
		if (doubled_target_score <= 0) { return 1; }
		else { return 0; }
	}
	if (num_buckets === 1) {
		if (doubled_target_score <= 0) { return 1; }
		else if (doubled_target_score > 2) { return 0; }
		else if (doubled_target_score == 2) { return total_population > strategy[0] ? 1 : 0; }
		else { return total_population >= strategy[0] ? 1 : 0; }
	}
	var available_points = num_buckets * (1 + num_buckets);
	if (available_points < doubled_target_score) { return 0; }
	else if (total_population === 0) { return 1; }

	if (already_asked[num_buckets-1][total_population-1][doubled_target_score] >= 0) {
		return already_asked[num_buckets-1][total_population-1][doubled_target_score];
	}

	var num_better = 0;
	for (var bid = 0 ; bid <= total_population ; ++bid) {
		var ask = strategy[num_buckets -1];
		var earned_pts = bid < ask ? 0 : (bid === ask ? num_buckets : 2*num_buckets);
		var new_target = Math.max(0, doubled_target_score -earned_pts);
		num_better += count_better_strategies_helper(strategy, already_asked, num_buckets-1, total_population -bid, new_target);
	}

	already_asked[num_buckets-1][total_population-1][doubled_target_score] = num_better;
	return num_better;
}

function count_better_strategies(strategy) {
	/**
	 * Count and return the number of strategies being better (or same) than <strategy>
	 * and having the same number of buckets and population
	 */
	
	var num_buckets = strategy.length;
	var total_population = accumulate(strategy, 0, (acc, cur) => acc + cur);
	var max_score = num_buckets * (1 + num_buckets) / 2;

	var already_asked = generate_n(num_buckets
			, () => generate_n(total_population
				, () => generate_n(max_score+1
					, () => -1)));
	return count_better_strategies_helper(strategy, already_asked, num_buckets, total_population, max_score);
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
	return accumulate(panel_strategies, 0, (acc, s) => strategy === s ? acc : acc + score_battle(strategy, s)[0]);
}

function mutated_strategy(strategy) {
	/**
	 * Derived an incoming <strategy> into a mutated version of itself
	 *
	 * Input strategy should not be modified
	 * Output strategy has the same size and population, it must be another array but might be equal
	 */

	var mutated = strategy.slice();
	var num_mutations = Math.floor((MAX_MUTATIONS +1) * Math.random());
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

function derive_from_parents(parents) {
	/**
	 * Derive two <parents> into a mutated version
	 */

	var generate_id = () => Math.floor(parents.length * Math.random());
	var parent_id = () => Math.random() < 0.5 ? 0 : 1;
	
	var population = accumulate(parents[0], 0, (acc, cur) => acc + cur);
	var familly = [parents[generate_id()], parents[generate_id()]];
	var idx = 0;
	var derived = normalize_array(population, generate_n(parents[0].length, () => familly[parent_id()][idx++]));
	return mutated_strategy(derived);
}

function mutated_strategies(strategies, trainer) {
	var scores = accumulate(strategies, [], (acc, s) => { acc.push(trainer(s, strategies)); return acc; });
	var sorted = sorted_against(strategies, scores, (a,b) => b-a);

	var NUM_KEPT_STRATEGIES = Math.floor(strategies.length * PERCENT_KEPT / 100.);
	var parents = sorted.slice(0, NUM_KEPT_STRATEGIES);
	for (var i = 0 ; i != sorted.length ; ++i) {
		sorted[i] = derive_from_parents(parents);
	}
	return sorted;
}

function best_strategy(strategies, trainer) {
	var scores = accumulate(strategies, [], (acc, s) => { acc.push(trainer(s, strategies)); return acc; });
	return max_against(strategies, scores);
}

var NUM_STRATEGIES = 100;
var NUM_PANEL_STRATEGIES = 1000;

function make_minimizer_trainer(total_population, num_buckets) {
	var worst_strategy = generate_n(num_buckets, () => 0);
	worst_strategy[0] = total_population;
	var worst_score = count_better_strategies(worst_strategy)
	return (strategy, others) => worst_score / count_better_strategies(strategy);
}

function make_panel_trainer() {
	var panel_strategies = generate_strategies(NUM_PANEL_STRATEGIES);
	return (strategy, others) => score_against_panel(panel_strategies, strategy);
}

function make_self_trained_trainer() {
	return (strategy, others) => score_against_panel(strategy, others);
}

function suggest_strategy(steps, trainer) {
	var strategies = generate_strategies(NUM_STRATEGIES);
	while (steps-- > 0) {
		strategies = mutated_strategies(strategies, trainer);
	}
	return best_strategy(strategies, trainer);
}

function suggest_strategy_retry(retries, trainer) {
	var strategies = generate_strategies(NUM_STRATEGIES);
	var panel_strategies = generate_strategies(NUM_PANEL_STRATEGIES);
	
	var current_best = 0;
	var num_failures = 0;
	while (num_failures < retries) {
		strategies = mutated_strategies(strategies, trainer);
		var previous_best = current_best;
		current_best = trainer(best_strategy(strategies, trainer), strategies);
		if (previous_best < current_best) { num_failures = 0; }
		else {
			++num_failures;
			current_best = previous_best;
		}
	}

	return best_strategy(strategies, trainer);
}
