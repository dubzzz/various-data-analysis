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
