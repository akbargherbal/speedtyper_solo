// PATTERN: Class Patterns (TypeScript-Specific)

class Person {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

class Person {
  constructor(public name: string, public age: number) {}
}

// PATTERN: Class Patterns (TypeScript-Specific)

class BankAccount {
  public balance: number;
  private accountNumber: string;
  protected owner: string;
  constructor(balance: number, accountNumber: string, owner: string) {
    this.balance = balance;
    this.accountNumber = accountNumber;
    this.owner = owner;
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

class Circle {
  readonly radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

abstract class Animal {
  abstract makeSound(): void;
}
class Dog extends Animal {
  makeSound(): void {
    console.log("Woof!");
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

interface Vehicle {
  start(): void;
  stop(): void;
}
class Car implements Vehicle {
  start(): void {
    console.log("Car started");
  }
  stop(): void {
    console.log("Car stopped");
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

class MathHelper {
  static readonly PI: number = 3.14159;
  static calculateArea(radius: number): number {
    return this.PI * radius * radius;
  }
}

// PATTERN: Class Patterns (TypeScript-Specific)

class Temperature {
  private _celsius: number;
  constructor(celsius: number) {
    this._celsius = celsius;
  }
  get celsius(): number {
    return this._celsius;
  }
  set celsius(value: number) {
    this._celsius = value;
  }
}