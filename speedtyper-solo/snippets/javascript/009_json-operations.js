const jsonString = '{"name":"Alice", "age":30}';
const user = JSON.parse(jsonString);
console.log(user.name);

const user = {name: "Bob", age:25};
const jsonString = JSON.stringify(user);
console.log(jsonString);

const user = {name: "Charlie", age:35};
const prettyJson = JSON.stringify(user, null, 2);
console.log(prettyJson);

const invalidJson = '{"name": "Dave", "age": }';
try {
  const user = JSON.parse(invalidJson);
  console.log(user);
} catch (error) {
  console.error("JSON parsing error:", error.message);
}