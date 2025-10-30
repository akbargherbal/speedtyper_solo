const userInput = "  hello world  ";
const cleanInput = userInput.trim();
console.log(cleanInput);

const csvData = "apple,banana,cherry";
const fruitArray = csvData.split(",");
console.log(fruitArray);

const words = ["Hello", "world", "!"];
const sentence = words.join(" ");
console.log(sentence);

const message = "Welcome to JavaScript";
const hasJavaScript = message.includes("JavaScript");
console.log(hasJavaScript);

const filename = "document.pdf";
const isPdf = filename.endsWith(".pdf");
const isDocument = filename.startsWith("document");
console.log(isPdf, isDocument);

const text = "I like cats. Cats are nice.";
const updatedText = text.replaceAll("cats", "dogs");
console.log(updatedText);

const mixedCase = "Hello World";
const lowerCase = mixedCase.toLowerCase();
const upperCase = mixedCase.toUpperCase();
console.log(lowerCase, upperCase);

const number = "42";
const paddedNumber = number.padStart(5, "0");
console.log(paddedNumber);

const name = "Alice";
const age = 30;
const greeting = `Hello, my name is ${name} and I am ${age} years old.`;
console.log(greeting);