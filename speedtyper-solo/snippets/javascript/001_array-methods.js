// PATTERN: Array Methods

const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);

const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 17 }];
const adult = users.find(user => user.age >= 18);

const numbers = [10, 20, -5, 30];
const firstNegativeIndex = numbers.findIndex(n => n < 0);

const scores = [85, 92, 78, 90];
const hasHighScore = scores.some(score => score > 95);

const ages = [18, 22, 25, 30];
const allAdults = ages.every(age => age >= 18);

const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, num) => acc + num, 0);

const numbers = [5, 2, 8, 1, 9];
numbers.sort((a, b) => a - b);

const array = [1, 2, 3, 4, 5];
const subArray = array.slice(1, 4);

const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = arr1.concat(arr2);

const nested = [1, [2, 3], [4]];
const flattened = nested.flat();

const sentences = ['Hello world', 'Web dev'];
const words = sentences.flatMap(s => s.split(' '));

const set = new Set([1, 2, 3]);
const arrayFromSet = Array.from(set);

const colors = ['red', 'green', 'blue'];
const hasGreen = colors.includes('green');

const fruits = ['apple', 'banana', 'cherry'];
const bananaIndex = fruits.indexOf('banana');