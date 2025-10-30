setTimeout(() => {
  console.log('Task completed after delay');
}, 3000);

const intervalId = setInterval(() => {
  console.log('Repeating task every second');
}, 1000);

const timeoutId = setTimeout(() => console.log('Never runs'), 5000);
clearTimeout(timeoutId);

const intervalId = setInterval(() => console.log('Repeating'), 1000);
clearInterval(intervalId);

const currentDate = new Date();
console.log(currentDate);

const date = new Date();
const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
console.log(formatted);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(getRandomInt(1, 100));

const value = 7.8;
console.log(Math.floor(value));
console.log(Math.ceil(value));
console.log(Math.round(value));

const integerString = '42';
const floatString = '3.14';
console.log(parseInt(integerString, 10));
console.log(parseFloat(floatString));

console.log(isNaN('text'));
console.log(Number.isNaN('text'));
console.log(Number.isNaN(NaN));

const name = 'Alice';
const age = 30;
console.log(typeof name);
console.log(typeof age);

const items = [1, 2, 3];
const notArray = 'hello';
console.log(Array.isArray(items));
console.log(Array.isArray(notArray));