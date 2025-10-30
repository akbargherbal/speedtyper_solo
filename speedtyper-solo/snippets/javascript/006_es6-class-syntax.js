class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

class Car {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
  }
  start() {
    console.log(`Starting ${this.brand} ${this.model}`);
  }
}

class Calculator {
  add(a, b) {
    return a + b;
  }
  subtract(a, b) {
    return a - b;
  }
}

class MathUtility {
  static multiply(a, b) {
    return a * b;
  }
  static divide(a, b) {
    return a / b;
  }
}

class Vehicle {
  constructor(type) {
    this.type = type;
  }
}
class Car extends Vehicle {
  constructor(brand) {
    super('car');
    this.brand = brand;
  }
}

class Animal {
  eat() {
    console.log('Animal is eating');
  }
}
class Dog extends Animal {
  eat() {
    super.eat();
    console.log('Dog is eating too');
  }
}