// PATTERN: Basic Type Annotations

let userName: string = "Alice";
let userAge: number = 30;
let isActive: boolean = true;
console.log(userName, userAge, isActive);

// PATTERN: Basic Type Annotations

let scores: number[] = [95, 87, 92];
let names: string[] = ["Bob", "Charlie"];
console.log(scores, names);

let numbers: Array<number> = [1, 2, 3];
let items: Array<string> = ["apple", "banana"];
console.log(numbers, items);

let person: { name: string; age: number } = { name: "David", age: 25 };
console.log(person.name, person.age);

// PATTERN: Basic Type Annotations

function greet(name: string, score: number): void {
  console.log(`Hello ${name}, your score is ${score}`);
}
greet("Eve", 88);

// PATTERN: Basic Type Annotations

function multiply(a: number, b: number): number {
  return a * b;
}
let product = multiply(4, 5);
console.log(product);

// PATTERN: Basic Type Annotations

function logMessage(message: string): void {
  console.log(message);
}
logMessage("Operation completed");

// PATTERN: Basic Type Annotations

let data: any = "Initial value";
data = 42;
data = false;
console.log(data);

// PATTERN: Basic Type Annotations

let input: unknown = "Hello World";
if (typeof input === "string") {
  console.log(input.toUpperCase());
}

// PATTERN: Basic Type Annotations

function throwError(message: string): never {
  throw new Error(message);
}
throwError("Critical failure");