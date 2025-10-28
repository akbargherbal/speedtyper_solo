function add(a: number, b: number): number {
  return a + b;
}

const sum: number = add(5, 10);
console.log(`The sum is: ${sum}`);

// This would cause a TypeScript error:
// add("5", "10");