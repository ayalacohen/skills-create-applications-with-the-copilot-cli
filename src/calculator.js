// Supported operations: addition (+), subtraction (-), multiplication (*), and division (/).
const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => left / right,
};

function calculate(left, operator, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error("Operands must be finite numbers.");
  }

  const operation = operations[operator];
  if (!operation) {
    throw new Error(`Unsupported operation "${operator}". Use +, -, *, or /.`);
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
  if (args.length !== 3) {
    throw new Error("Usage: node src/calculator.js <number> <+|-|*|/> <number>");
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

module.exports = { calculate };
