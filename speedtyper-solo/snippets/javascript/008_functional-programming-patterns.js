function calculateArea(width, height) {
  return width * height;
}

const user = { name: 'Alice', age: 30 };
const updatedUser = { ...user, age: 31 };

const compose = (f, g) => (x) => f(g(x));
const addOne = x => x + 1;
const double = x => x * 2;
const addOneThenDouble = compose(double, addOne);

const add = a => b => a + b;
const add5 = add(5);
console.log(add5(3));

const numbers = [1, 2, 3];
const doubled = numbers.map(num => num * 2);
console.log(doubled);

setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);

(function() {
  console.log('IIFE executed');
})();