const numbers = [10, 20, 30, 40];

// .reduce() executes a reducer function to produce a single value.
const sum = numbers.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, 0); // 0 is the initial value

console.log(`The sum is: ${sum}`); // The sum is: 100