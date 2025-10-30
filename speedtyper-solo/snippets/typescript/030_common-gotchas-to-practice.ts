const scores: number[] = [95, 87, 92];
const user: [string, number] = ["John", 25];
console.log(`Scores: ${scores.join(", ")}`);
console.log(`User: ${user[0]}, Age: ${user[1]}`);

function getUserName(id: number): string | undefined {
  if (id === 1) return "Alice";
  return undefined;
}
const name = getUserName(2);
if (name === undefined) {
  console.log("User not found");
} else {
  console.log(`User: ${name}`);
}

const fixedDirection = "north";
let variableDirection = "south";
console.log(`Fixed: ${fixedDirection}, Variable: ${variableDirection}`);

function handleInput(input: string | number) {
  if (typeof input === "string") {
    console.log(input.toUpperCase());
  } else {
    console.log(input * 2);
  }
}
handleInput("hello");
handleInput(10);

type Theme = "light" | "dark";
const currentTheme = "dark" satisfies Theme;
console.log(`Current theme: ${currentTheme}`);