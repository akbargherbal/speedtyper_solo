import { calculateSum, formatDate } from './utils.js';

import App from './App.js';

import * as math from './math.js';

export const PI = 3.14;
export function greet(name) {
  return `Hello, ${name}!`;
}

export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

async function loadChart() {
  const chartModule = await import('./chart.js');
  chartModule.render();
}

const numbers = [1, 2, 3];
for (const num of numbers) {
  console.log(num);
}

const user = { name: 'Alice', age: 30 };
for (const prop in user) {
  console.log(`${prop}: ${user[prop]}`);
}

const firstName = 'John';
const lastName = 'Doe';
const person = {
  firstName,
  lastName,
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};

function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const uniqueKey = Symbol('userKey');