const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { calculate, modulo, power, squareRoot } = require("../calculator");

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

test("calculates modulo, including negative values", () => {
  assert.equal(modulo(10, 3), 1);
  assert.equal(modulo(-10, 3), -1);
  assert.equal(modulo(10, -3), 1);
  assert.equal(calculate(10, "%", 3), 1);
});

test("rejects modulo by zero and non-finite operands", () => {
  assert.throws(() => modulo(10, 0), {
    message: "Cannot calculate modulo by zero.",
  });
  assert.throws(() => modulo(10, -0), /modulo by zero/);
  assert.throws(() => modulo(Number.NaN, 3), /finite numbers/);
});

test("calculates powers for positive, zero, negative, and fractional exponents", () => {
  assert.equal(power(2, 3), 8);
  assert.equal(power(5, 0), 1);
  assert.equal(power(2, -2), 0.25);
  assert.equal(power(9, 0.5), 3);
  assert.equal(calculate(2, "**", 3), 8);
});

test("rejects non-finite power operands", () => {
  assert.throws(() => power(Number.POSITIVE_INFINITY, 2), /finite numbers/);
  assert.throws(() => power(2, Number.NaN), /finite numbers/);
});

test("calculates square roots of zero and positive numbers", () => {
  assert.equal(squareRoot(0), 0);
  assert.equal(squareRoot(9), 3);
  assert.equal(squareRoot(2), Math.sqrt(2));
});

test("rejects square roots of negative and non-finite numbers", () => {
  assert.throws(() => squareRoot(-1), {
    message: "Cannot calculate the square root of a negative number.",
  });
  assert.throws(() => squareRoot(Number.POSITIVE_INFINITY), /finite numbers/);
});

test("matches the extended-operations examples", () => {
  assert.equal(modulo(5, 2), 1);
  assert.equal(power(2, 3), 8);
  assert.equal(squareRoot(16), 4);
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
  assert.throws(() => calculate(8, "&", 3), /Unsupported operation/);
  assert.throws(() => calculate(8, "plus", 3), /Unsupported operation/);
});

test("rejects non-finite and non-numeric operands", () => {
  for (const operand of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "3", null]) {
    assert.throws(() => calculate(operand, "+", 1), /finite numbers/);
    assert.throws(() => calculate(1, "+", operand), /finite numbers/);
  }
});

test("CLI prints a result and exits successfully", () => {
  const examples = [
    { args: ["2", "+", "3"], expected: "5\n" },
    { args: ["5", "%", "2"], expected: "1\n" },
    { args: ["2", "**", "3"], expected: "8\n" },
    { args: ["sqrt", "16"], expected: "4\n" },
  ];

  for (const { args, expected } of examples) {
    const result = spawnSync(process.execPath, [calculatorPath, ...args], {
      encoding: "utf8",
    });

    assert.equal(result.status, 0, `CLI failed for ${args.join(" ")}`);
    assert.equal(result.stdout, expected);
    assert.equal(result.stderr, "");
  }
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

  const negativeSquareRoot = spawnSync(process.execPath, [calculatorPath, "sqrt", "-1"], {
    encoding: "utf8",
  });
  assert.equal(negativeSquareRoot.status, 1);
  assert.match(negativeSquareRoot.stderr, /square root of a negative number/);

  const moduloByZero = spawnSync(process.execPath, [calculatorPath, "10", "%", "0"], {
    encoding: "utf8",
  });
  assert.equal(moduloByZero.status, 1);
  assert.match(moduloByZero.stderr, /modulo by zero/);
});
