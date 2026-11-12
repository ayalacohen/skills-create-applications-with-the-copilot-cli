// Supported operations: addition (+), subtraction (-), multiplication (*), division (/),
// modulo (%), exponentiation (**), and square root (sqrt).
function assertFiniteNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Operands must be finite numbers.");
  }
}

function modulo(a, b) {
  assertFiniteNumber(a);
  assertFiniteNumber(b);

  if (b === 0) {
    throw new Error("Cannot calculate modulo by zero.");
  }

  return a % b;
}

function power(base, exponent) {
  assertFiniteNumber(base);
  assertFiniteNumber(exponent);
  return base ** exponent;
}

function squareRoot(n) {
  assertFiniteNumber(n);

  if (n < 0) {
    throw new Error("Cannot calculate the square root of a negative number.");
  }

  return Math.sqrt(n);
}

const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => left / right,
  "%": modulo,
  "**": power,
};

function calculate(left, operator, right) {
  assertFiniteNumber(left);
  assertFiniteNumber(right);

  const operation = operations[operator];
  if (!operation) {
    throw new Error(`Unsupported operation "${operator}". Use +, -, *, /, %, or **.`);
  }

  if (operator === "/" && right === 0) {
    throw new Error("Cannot divide by zero.");
  }

  return operation(left, right);
}

function parseOperand(value) {
  if (value.trim() === "") {
    throw new Error("Operands must be finite numbers.");
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`"${value}" is not a valid number.`);
  }

  return number;
}

function main(args) {
  if (args[0] === "sqrt" && args.length === 2) {
    console.log(squareRoot(parseOperand(args[1])));
    return;
  }

  if (args.length !== 3) {
    throw new Error(
      "Usage: node src/calculator.js <number> <+|-|*|/|%|**> <number> or node src/calculator.js sqrt <number>",
    );
  }

  const [left, operator, right] = args;
  console.log(calculate(parseOperand(left), operator, parseOperand(right)));
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { calculate, modulo, power, squareRoot };
