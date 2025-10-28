function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processInput(input: string | number) {
  if (isString(input)) {
    // TypeScript now knows `input` is a string here
    console.log(input.toUpperCase());
  } else {
    // TypeScript knows `input` is a number here
    console.log(input * 2);
  }
}

processInput("hello");
processInput(42);