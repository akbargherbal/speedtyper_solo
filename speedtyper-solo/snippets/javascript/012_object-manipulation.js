// PATTERN: Object Manipulation

const user = { name: 'Alice', age: 30 };
const keys = Object.keys(user);
console.log(keys);

const user = { name: 'Alice', age: 30 };
const values = Object.values(user);
console.log(values);

const user = { name: 'Alice', age: 30 };
const entries = Object.entries(user);
console.log(entries);

// PATTERN: Object Manipulation

const obj1 = { a: 1 };
const obj2 = { b: 2 };
const merged = Object.assign({}, obj1, obj2);
console.log(merged);

// PATTERN: Object Manipulation

const entries = [['name', 'Bob'], ['age', 25]];
const obj = Object.fromEntries(entries);
console.log(obj);

const key = 'dynamicKey';
const obj = { [key]: 'value' };
console.log(obj);

// PATTERN: Object Manipulation

const name = 'Charlie';
const age = 35;
const user = { name, age };
console.log(user);

// PATTERN: Object Manipulation

const calculator = {
  add(a, b) {
    return a + b;
  }
};
console.log(calculator.add(2, 3));