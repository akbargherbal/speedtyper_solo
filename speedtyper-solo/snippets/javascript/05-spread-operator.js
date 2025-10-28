// For arrays
const arr1 = ['a', 'b'];
const arr2 = [...arr1, 'c', 'd'];
console.log(arr2); // ['a', 'b', 'c', 'd']

// For objects
const obj1 = { name: "Alice", age: 30 };
const obj2 = { ...obj1, city: "New York" };
console.log(obj2); // { name: 'Alice', age: 30, city: 'New York' }