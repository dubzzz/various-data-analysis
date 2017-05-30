QUnit.start();

QUnit.module("generate_strategy");

function check_generate_strategy(assert, population, num_buckets) {
	var generated = generate_strategy(population, num_buckets);
	assert.ok(Array.isArray(generated), "output is an array");
	assert.strictEqual(generated.length, num_buckets, "number of buckets should be " + num_buckets);
	assert.ok(all_of(generated, i => Number.isInteger(i)), "values are integers");
	assert.ok(all_of(generated, i => i >= 0), "values are positive");
	assert.strictEqual(accumulate(generated, 0, (acc, cur) => acc + cur), population, "values sum to " + population);
}

QUnit.test("with non null values", function(assert) {
	check_generate_strategy(assert, 101, 10);
});

QUnit.test("with only one of population", function(assert) {
	check_generate_strategy(assert, 1, 10);
});

QUnit.test("with only one bucket", function(assert) {
	check_generate_strategy(assert, 101, 1);
});
