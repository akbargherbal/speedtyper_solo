const numbers = [1, 2, 3, 4, 5, 6];

// .map() creates a new array by transforming every element.
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12]

// .filter() creates a new array with elements that pass a test.
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4, 6]