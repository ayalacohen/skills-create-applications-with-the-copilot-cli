const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { calculate } = require("../calculator");

const calculatorPath = path.join(__dirname, "..", "calculator.js");

test("adds numbers, including zero, negatives, and decimals", () => {
  assert.equal(calculate(2, "+", 3), 5);
  assert.equal(calculate(0, "+", 0), 0);
  assert.equal(calculate(-4, "+", 1.5), -2.5);
});

test("subtracts numbers, including negative results and negative operands", () => {
  assert.equal(calculate(10, "-", 4), 6);
  assert.equal(calculate(3, "-", 8), -5);
  assert.equal(calculate(-2, "-", -5), 3);
});

test("multiplies numbers, including zero, negatives, and decimals", () => {
  assert.equal(calculate(45, "*", 2), 90);
  assert.equal(calculate(0, "*", 12), 0);
  assert.equal(calculate(-2, "*", 1.5), -3);
});

test("divides numbers, including fractional and negative results", () => {
  assert.equal(calculate(20, "/", 5), 4);
  assert.equal(calculate(1, "/", 2), 0.5);
  assert.equal(calculate(-9, "/", 3), -3);
});

test("rejects division by positive and negative zero", () => {
  assert.throws(() => calculate(8, "/", 0), {
    message: "Cannot divide by zero.",
  });
  assert.throws(() => calculate(8, "/", -0), {
    message: "Cannot divide by zero.",
  });
});

test("rejects unsupported operations", () => {
  assert.throws(() => calculate(8, "%", 3), /Unsupported operation/);
  assert.throws(() => calculate(8, "plus", 3), /Unsupported operation/);
});

test("rejects non-finite and non-numeric operands", () => {
  for (const operand of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "3", null]) {
    assert.throws(() => calculate(operand, "+", 1), /finite numbers/);
    assert.throws(() => calculate(1, "+", operand), /finite numbers/);
  }
});

test("CLI prints a result and exits successfully", () => {
  const result = spawnSync(process.execPath, [calculatorPath, "2", "+", "3"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "5\n");
  assert.equal(result.stderr, "");
});

test("CLI reports division by zero and exits unsuccessfully", () => {
  const result = spawnSync(process.execPath, [calculatorPath, "20", "/", "0"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "Error: Cannot divide by zero.\n");
});

test("CLI validates its arguments", () => {
  const missingOperand = spawnSync(process.execPath, [calculatorPath, "2", "+"], {
    encoding: "utf8",
  });
  assert.equal(missingOperand.status, 1);
  assert.match(missingOperand.stderr, /Usage:/);

  const invalidOperand = spawnSync(process.execPath, [calculatorPath, "nope", "+", "3"], {
    encoding: "utf8",
  });
  assert.equal(invalidOperand.status, 1);
  assert.match(invalidOperand.stderr, /not a valid number/);
});
