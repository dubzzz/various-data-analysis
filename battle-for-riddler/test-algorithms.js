QUnit.start();

QUnit.module("all_of");

QUnit.test("empty array", function(assert) {
	assert.ok(all_of([], () => true), "predicate always true");
	assert.ok(all_of([], () => false), "predicate always false");
});

QUnit.test("everything match", function(assert) {
	assert.ok(all_of([1,2,3], () => true), "should be true");
});

QUnit.test("nothing match", function(assert) {
	assert.notOk(all_of([1,2,3], () => false), "should be false");
});

QUnit.test("one mismatch", function(assert) {
	assert.notOk(all_of([1,2,3], (e) => e != 2), "should be false");
});

QUnit.module("none_of");

QUnit.test("empty array", function(assert) {
	assert.ok(none_of([], () => true), "predicate always true");
	assert.ok(none_of([], () => false), "predicate always false");
});

QUnit.test("everything match", function(assert) {
	assert.notOk(none_of([1,2,3], () => true), "should be false");
});

QUnit.test("nothing match", function(assert) {
	assert.ok(none_of([1,2,3], () => false), "should be true");
});

QUnit.test("one match", function(assert) {
	assert.notOk(none_of([1,2,3], (e) => e == 2), "should be false");
});

QUnit.module("one_of");

QUnit.test("empty array", function(assert) {
	assert.notOk(one_of([], () => true), "predicate always true");
	assert.notOk(one_of([], () => false), "predicate always false");
});

QUnit.test("everything match", function(assert) {
	assert.ok(one_of([1,2,3], () => true), "should be true");
});

QUnit.test("nothing match", function(assert) {
	assert.notOk(one_of([1,2,3], () => false), "should be false");
});

QUnit.test("one match", function(assert) {
	assert.ok(one_of([1,2,3], (e) => e == 2), "should be true");
});

QUnit.module("accumulate");

QUnit.test("empty array", function(assert) {
	assert.strictEqual(accumulate([], 0, (acc, cur) => acc + cur), 0, "with null initial value");
	assert.strictEqual(accumulate([], 42, (acc, cur) => acc + cur), 42, "with non null initial value");
});

QUnit.test("accumulate every entry", function(assert) {
	assert.strictEqual(accumulate([1,5,2], 0, (acc, cur) => acc + cur), 8, "with null initial value");
});

QUnit.test("accumulate in right order", function(assert) {
	assert.equal(accumulate(["1","5","2"], "", (acc, cur) => acc + cur), "152", "with empty string initial value");
});

QUnit.test("accumulate on arrays", function(assert) {
	assert.deepEqual(accumulate([1,5,2], [], (acc, cur) => { acc.push(cur*cur); return acc; }), [1,25,4], "squared array");
});

QUnit.module("generate_n");

QUnit.test("n is null", function(assert) {
	assert.strictEqual(generate_n(0, () => -1).length, 0, "empty array");
});

QUnit.test("right size", function(assert) {
	assert.deepEqual(generate_n(3, () => -1), [-1,-1,-1], "expected array");
});
