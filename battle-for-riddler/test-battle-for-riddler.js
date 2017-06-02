QUnit.start();

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

QUnit.module("normalize_array");

function check_random_normalized_array(assert, generated, population, num_buckets) {
	assert.ok(Array.isArray(generated), "output is an array");
	assert.strictEqual(generated.length, num_buckets, "number of buckets should be " + num_buckets);
	assert.ok(all_of(generated, i => Number.isInteger(i)), "values are integers");
	assert.ok(all_of(generated, i => i >= 0), "values are positive");
	assert.strictEqual(accumulate(generated, 0, (acc, cur) => acc + cur), population, "values sum to " + population);
}

function check_normalize_array(assert, population, array) {
	var out = normalize_array(population, array);
	check_random_normalized_array(assert, out, population, array.length);

	var strength = accumulate(array, 0, (acc, cur) => acc + cur);
	if (strength == 0) {
		array = generate_n(array.length, () => 1);
		strength = array.length;
	}
	var ratio = 1. * population / strength;
	for (var idx = 0 ; idx != array.length ; ++idx) {
		var min_value = Math.floor(ratio * array[idx]);
		var max_value = Math.ceil(ratio * array[idx]);
		assert.ok(min_value <= out[idx] && out[idx] <= max_value, "normalized value at #" + idx + " must be between " + min_value + " (floor) and " + max_value + " (ceil)");
	}
}

QUnit.test("zero values only", function(assert) {
	check_normalize_array(assert, 4, [0,0,0,0]);
});

QUnit.test("zero values only, rounding issue", function(assert) {
	check_normalize_array(assert, 4, [0,0,0]);
});

QUnit.test("no rounding issue", function(assert) {
	check_normalize_array(assert, 12, [1,2,3]);
});

QUnit.test("rounding issue", function(assert) {
	check_normalize_array(assert, 10, [1,2,3]);
});

QUnit.test("not enough elements to fill everyone", function(assert) {
	check_normalize_array(assert, 1, [1,2,3]);
});

QUnit.test("input array contain doubles", function(assert) {
	check_normalize_array(assert, 10, [1.5,2.8,3.14]);
});

QUnit.module("random_normalized_array");

QUnit.test("with non null values", function(assert) {
	check_random_normalized_array(assert, random_normalized_array(101, 10), 101, 10);
});

QUnit.test("with only one of population", function(assert) {
	check_random_normalized_array(assert, random_normalized_array(1, 10), 1, 10);
});

QUnit.test("with only one bucket", function(assert) {
	check_random_normalized_array(assert, random_normalized_array(101, 1), 101, 1);
});

QUnit.module("sorted_against");

QUnit.test("should not alter the inputs", function(assert) {
	var input = [5,8,1];
	var values = [1,3,2];
	var out = sorted_against(input, values, (a,b) => a-b);
	assert.deepEqual(input, [5,8,1], "no impact on input");
	assert.deepEqual(values, [1,3,2], "no impact on values");
	assert.ok(input !== out, "out different from input (in terms of pointer)");
});

QUnit.test("sorted against values", function(assert) {
	var input = [5,8,1,7,9,0];
	var values = [1,3,6,2,5,4];

	assert.deepEqual(sorted_against(input, values, (a,b) => a-b), [5,7,8,0,9,1], "sorted against values");
	assert.deepEqual(sorted_against(input, values, (a,b) => b-a), [1,9,0,8,7,5], "sorted against values (reverse)");
});

QUnit.module("max_against");

QUnit.test("should not alter the inputs", function(assert) {
	var input = [5,8,1];
	var values = [1,3,2];
	var out = max_against(input, values, (a,b) => a-b);
	assert.deepEqual(input, [5,8,1], "no impact on input");
	assert.deepEqual(values, [1,3,2], "no impact on values");
	assert.ok(input !== out, "out different from input (in terms of pointer)");
});

QUnit.test("max against values", function(assert) {
	assert.deepEqual(max_against([5,8,1,7,9,0], [1,3,6,2,5,4]), 1, "max against values (reverse)");
});

QUnit.module("generate_strategies");

QUnit.test("generate no strategy", function(assert) {
	var strategies = generate_strategies(0);
	assert.ok(Array.isArray(strategies), "output is an array");
	assert.strictEqual(strategies.length, 0, "number of strategies should be 0");
});

QUnit.test("generate one strategy", function(assert) {
	var strategies = generate_strategies(1);
	assert.ok(Array.isArray(strategies), "output is an array");
	assert.strictEqual(strategies.length, 1, "number of strategies should be 1");
	for (var idx = 0 ; idx != strategies.length ; ++idx) {
		check_random_normalized_array(assert, strategies[idx], STRATEGY_POPULATION, STRATEGY_SIZE);
	}
});

QUnit.test("generate multiple strategies", function(assert) {
	var strategies = generate_strategies(42);
	assert.ok(Array.isArray(strategies), "output is an array");
	assert.strictEqual(strategies.length, 42, "number of strategies should be 42");
	for (var idx = 0 ; idx != strategies.length ; ++idx) {
		check_random_normalized_array(assert, strategies[idx], STRATEGY_POPULATION, STRATEGY_SIZE);
	}
});

QUnit.module("count_better_strategies");

QUnit.test("empty strategy", function(assert) {
	assert.strictEqual(count_better_strategies([]), 1, "itself is the only better strategy");
});

QUnit.test("one entry strategy", function(assert) {
	assert.strictEqual(count_better_strategies([10]), 1, "itself is the only better strategy");
});

QUnit.test("worst strategy", function(assert) {
	// all possible combinations are better than this one
	// strictly better: [0,1,0] or [0,0,1]
	// same           : [1,0,0]
	assert.strictEqual(count_better_strategies([1, 0, 0]), 3, "right number of better strategies");

	// strictly better: [0,2,0] or [0,0,2] or [1,1,0] or [1,0,1] or [0,1,1]
	// same           : [2,0,0]
	assert.strictEqual(count_better_strategies([2, 0, 0]), 6, "right number of better strategies");
});

QUnit.test("worst game strategy", function(assert) {
	assert.strictEqual(count_better_strategies([2, 0]), 3, "right number of better strategies");
	assert.strictEqual(count_better_strategies([2, 0, 0]), 6, "right number of better strategies"); // * (2/2 +1)
	assert.strictEqual(count_better_strategies([2, 0, 0, 0]), 10, "right number of better strategies"); // * (2/3 +1)
	assert.strictEqual(count_better_strategies([2, 0, 0, 0, 0]), 15, "right number of better strategies"); // * (2/4 +1)
	assert.strictEqual(count_better_strategies([2, 0, 0, 0, 0, 0]), 21, "right number of better strategies"); // ...

	assert.strictEqual(count_better_strategies([100, 0]), 101, "right number of better strategies");
	assert.strictEqual(count_better_strategies([100, 0, 0]), 5151, "right number of better strategies"); // * (100/2 +1)
	assert.strictEqual(count_better_strategies([100, 0, 0, 0]), 176851, "right number of better strategies"); // * (100/3 +1)
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0]), 4598126, "right number of better strategies"); // * (100/4 +1)
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0, 0]), 96560646, "right number of better strategies"); // ...
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0, 0, 0]), 1705904746, "right number of better strategies");
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0, 0, 0, 0]), 26075972546, "right number of better strategies");
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0, 0, 0, 0, 0]), 352025629371, "right number of better strategies");
	assert.strictEqual(count_better_strategies([100, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 4263421511271, "right number of better strategies");
});

QUnit.test("only one strictly better strategy", function(assert) {
	// strictly better: [0,0,2]
	// same           : [0,1,1]
	assert.strictEqual(count_better_strategies([0, 1, 1]), 2, "right number of better strategies");
});

QUnit.test("nothing is strictly better", function(assert) {
	// same           : [0,0,2] or [1,1,0]
	assert.strictEqual(count_better_strategies([0, 0, 2]), 2, "right number of better strategies");

	// same           : [0,0,3] or [1,2,0] or [2,1,0] or [1,1,1]
	assert.strictEqual(count_better_strategies([0, 0, 3]), 4, "right number of better strategies");
});

QUnit.test("multiple better strategies", function(assert) {
	// strictly better: [0,0,3] or [0,1,2] or [1,0,2] or [0,2,1] or [1,1,1]
	// same           : [2,0,1]
	assert.strictEqual(count_better_strategies([2, 0, 1]), 6, "right number of better strategies");

	// strictly better: [0,0,1,2] or [0,1,0,2]
	//                  or [0,0,2,1] or [2,0,0,1] or [0,2,0,1] or [1,1,0,1] or [0,1,1,1] or [1,0,1,1]
	//                  or [0,0,3,0] or [0,1,2,0] or [1,0,2,0] or [0,2,1,0] or [1,1,1,0]
	// same           : [0,0,0,3] or [1,0,0,2] or [2,0,1,0]
	assert.strictEqual(count_better_strategies([2, 0, 1, 0]), 16, "right number of better strategies");
});

QUnit.module("run_battle");

QUnit.test("battle on empty strategies", function(assert) {
	assert.strictEqual(run_battle([], []), 0, "no winner");
});

QUnit.test("1st player wins", function(assert) {
	assert.strictEqual(run_battle([1,1,1,5], [1,1,5,1]), 1, "1st player wins");
});

QUnit.test("2nd player wins", function(assert) {
	assert.strictEqual(run_battle([0,0,0,0,10], [1,1,1,1,6]), 2, "2nd player wins");
});

QUnit.test("no winner: same strategy", function(assert) {
	assert.strictEqual(run_battle([0,1,0,1], [0,1,0,1]), 0, "no winner");
	assert.strictEqual(run_battle([1,51,2,36,42], [1,51,2,36,42]), 0, "no winner");
});

QUnit.test("no winner: different strategy", function(assert) {
	assert.strictEqual(run_battle([0,0,2], [1,1,0]), 0, "no winner");
});

QUnit.test("detect possible rounding issue", function(assert) {
	assert.strictEqual(run_battle([1,1,1], [0,1,1]), 1, "1st wins");
	assert.strictEqual(run_battle([1,1,0], [0,0,1]), 0, "no winner");
});

QUnit.module("score_battle");

QUnit.test("expected outputs", function(assert) {
	assert.deepEqual(score_battle([3,0,0], [1,1,1]), [0,BATTLE_WIN], "2nd wins");
	assert.deepEqual(score_battle([1,1,1],[3,0,0]), [BATTLE_WIN,0], "1st wins");
	assert.deepEqual(score_battle([1,1,1],[1,1,1]), [BATTLE_EQUALITY,BATTLE_EQUALITY], "no winner");
});

QUnit.module("score_against_panel");

QUnit.test("empty panel", function(assert) {
	assert.strictEqual(score_against_panel([], [1,1,1]), 0, "null score");
});

QUnit.test("real panel", function(assert) {
	assert.strictEqual(score_against_panel([[3,0,0],[0,3,0],[0,0,3],[0,1,2]], [1,1,1]), BATTLE_WIN + BATTLE_WIN + BATTLE_EQUALITY + 0, "score should be to 2x wins + 1x equality");
});

QUnit.test("strategy is also in the panel", function(assert) {
	var panel = [[1,1,1],[3,0,0],[0,3,0],[0,0,3],[0,1,2]];
	assert.strictEqual(score_against_panel(panel, panel[0]), BATTLE_WIN + BATTLE_WIN + BATTLE_EQUALITY + 0, "score should be to 2x wins + 1x equality");
});

QUnit.module("mutated_strategy");

QUnit.test("should not alter the input", function(assert) {
	var input = [1,2,3];
	mutated_strategy(input);
	assert.deepEqual(input, [1,2,3], "same values");
});

QUnit.test("should not be the same array as input (in terms of pointer)", function(assert) {
	var input = [1,2,3];
	var out = mutated_strategy(input);
	assert.ok(input !== out, "different arrays");
});

QUnit.test("same population and same size as input", function(assert) {
	var out = mutated_strategy([5,8,9,10,3,6,42]);
	assert.strictEqual(out.length, 7, "same size");
	assert.strictEqual(accumulate(out, 0, (acc, cur) => acc + cur), 83, "same population");
});

QUnit.test("output remains a valid strategy", function(assert) {
	var out = mutated_strategy([5,8,1,10,0,6,12]);
	check_random_normalized_array(assert, out, 42, 7);
});
