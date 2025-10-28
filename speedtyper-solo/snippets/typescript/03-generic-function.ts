function identity<T>(arg: T): T {
  return arg;
}

// The type is inferred from the argument
let outputString = identity("hello");
let outputNumber = identity(123);

console.log(typeof outputString); // string
console.log(typeof outputNumber); // number