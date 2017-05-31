QUnit.start();

QUnit.module("spread_accross_buckets");

function check_spread_accross_buckets(assert, generated, population, num_buckets) {
	assert.ok(Array.isArray(generated), "output is an array");
	assert.strictEqual(generated.length, num_buckets, "number of buckets should be " + num_buckets);
	assert.ok(all_of(generated, i => Number.isInteger(i)), "values are integers");
	assert.ok(all_of(generated, i => i >= 0), "values are positive");
	assert.strictEqual(accumulate(generated, 0, (acc, cur) => acc + cur), population, "values sum to " + population);
}

QUnit.test("with non null values", function(assert) {
	check_spread_accross_buckets(assert, spread_accross_buckets(101, 10), 101, 10);
});

QUnit.test("with only one of population", function(assert) {
	check_spread_accross_buckets(assert, spread_accross_buckets(1, 10), 1, 10);
});

QUnit.test("with only one bucket", function(assert) {
	check_spread_accross_buckets(assert, spread_accross_buckets(101, 1), 101, 1);
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
		check_spread_accross_buckets(assert, strategies[idx], STRATEGY_POPULATION, STRATEGY_SIZE);
	}
});

QUnit.test("generate multiple strategies", function(assert) {
	var strategies = generate_strategies(42);
	assert.ok(Array.isArray(strategies), "output is an array");
	assert.strictEqual(strategies.length, 42, "number of strategies should be 42");
	for (var idx = 0 ; idx != strategies.length ; ++idx) {
		check_spread_accross_buckets(assert, strategies[idx], STRATEGY_POPULATION, STRATEGY_SIZE);
	}
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
	check_spread_accross_buckets(assert, out, 42, 7);
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
