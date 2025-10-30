interface Person {
  name: string;
  age: number;
}

interface User {
  username: string;
  email?: string;
}

interface Config {
  readonly id: number;
  name: string;
}

interface Animal {
  species: string;
}
interface Dog extends Animal {
  breed: string;
}

interface PhoneBook {
  [name: string]: string;
}

interface Calculator {
  add(x: number, y: number): number;
}

interface Incrementer {
  (): number;
  value: number;
}