const userIsLoggedIn = true;
const age = 25;

const welcomeMessage = userIsLoggedIn ? "Welcome back!" : "Please log in.";
console.log(welcomeMessage);

const userStatus = age >= 18 ? "Adult" : "Minor";
console.log(`User status: ${userStatus}`);