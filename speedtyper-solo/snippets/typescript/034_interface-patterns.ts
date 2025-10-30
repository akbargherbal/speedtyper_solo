// PATTERN: Interface Patterns

interface Person {
  name: string;
  age: number;
}

// PATTERN: Interface Patterns

interface User {
  username: string;
  email?: string;
}

// PATTERN: Interface Patterns

interface Config {
  readonly id: number;
  name: string;
}

// PATTERN: Interface Patterns

interface Animal {
  species: string;
}
interface Dog extends Animal {
  breed: string;
}

// PATTERN: Interface Patterns

interface PhoneBook {
  [name: string]: string;
}

interface Calculator {
  add(x: number, y: number): number;
}

// PATTERN: Interface Patterns

interface Incrementer {
  (): number;
  value: number;
}