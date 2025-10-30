// PATTERN: Modern JavaScript Patterns

import { calculateSum, formatDate } from './utils.js';

import App from './App.js';

import * as math from './math.js';

// PATTERN: Modern JavaScript Patterns

export const PI = 3.14;
export function greet(name) {
  return `Hello, ${name}!`;
}

// PATTERN: Modern JavaScript Patterns

export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

// PATTERN: Modern JavaScript Patterns

async function loadChart() {
  const chartModule = await import('./chart.js');
  chartModule.render();
}

// PATTERN: Modern JavaScript Patterns

const numbers = [1, 2, 3];
for (const num of numbers) {
  console.log(num);
}

// PATTERN: Modern JavaScript Patterns

const user = { name: 'Alice', age: 30 };
for (const prop in user) {
  console.log(`${prop}: ${user[prop]}`);
}

// PATTERN: Modern JavaScript Patterns

const firstName = 'John';
const lastName = 'Doe';
const person = {
  firstName,
  lastName,
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};

// PATTERN: Modern JavaScript Patterns

function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

// PATTERN: Modern JavaScript Patterns

const uniqueKey = Symbol('userKey');