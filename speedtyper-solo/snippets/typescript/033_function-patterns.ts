type MathOperation = (a: number, b: number) => number;
const multiply: MathOperation = (x, y) => x * y;
const result = multiply(4, 5);
console.log(result);

function createUser(name: string, age?: number): string {
  return age ? `${name} is ${age} years old` : `User ${name}`;
}
console.log(createUser("Alice"));
console.log(createUser("Bob", 30));

function greetUser(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}
console.log(greetUser("Charlie"));
console.log(greetUser("Dana", "Hi"));

function calculateAverage(...scores: number[]): number {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return total / scores.length;
}
console.log(calculateAverage(85, 90, 78));

function parseInput(input: string): string;
function parseInput(input: number): number;
function parseInput(input: any): any {
  if (typeof input === 'string') return input.trim();
  if (typeof input === 'number') return input * 2;
}
console.log(parseInput("  hello  "));
console.log(parseInput(10));

const isEven = (num: number): boolean => num % 2 === 0;
console.log(isEven(4));
console.log(isEven(7));

type DataHandler = (data: string) => void;
function fetchData(callback: DataHandler): void {
  callback("Sample data");
}
fetchData((data) => console.log(data));

function delay(ms: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve("Done"), ms));
}
delay(1000).then(console.log);

async function getUser(id: number): Promise<{ name: string }> {
  return { name: `User${id}` };
}
getUser(1).then(user => console.log(user.name));